import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { UsersModel } from 'src/users/entities/users.entity';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { ChatRoomService } from 'src/chat-room/chat-room.service';
import { ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: 'http://15.165.113.58', // 클라이언트 애플리케이션의 호스트
    credentials: true,
  },
  namespace: '/chat',
})
@UseInterceptors(ClassSerializerInterceptor)
export class ChatGateway
  implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect
{
  //귓속말 기능을 위한 매핑
  private userSockets = new Map<string, string>();
  constructor(
    private readonly chatService: ChatService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly chatRoomService: ChatRoomService,
  ) {}

  @WebSocketServer()
  server: Server;

  afterInit(server: any) {
    // throw new Error('Method not implemented.');
    console.log(`after gateway init`);
  }
  async handleConnection(
    socket: Socket & { user: UsersModel },
    ...args: any[]
  ) {
    console.log(`Client connected: ${socket.id}`);
    // query에서 토큰 가져오기
    const rawToken = socket.handshake.query.token;

    if (!rawToken) {
      socket.disconnect();
    }

    try {
      const token = this.authService.extractTokenFromHeader(
        rawToken.toString(),
        true,
      );
      // console.log(token);
      const payload = this.authService.verifyToken(token);

      const user = await this.usersService.getUserByEmail(payload.email);

      // console.log('????', user);
      //소켓에 유저의 정보를 넣어준다
      socket.user = user;
      //사용자 연결시 userSockets맵에도 추가(귓속말 받으려면)
      this.userSockets.set(socket.user.nickname, socket.id);
    } catch (e) {
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket & { user: UsersModel }) {
    console.log(`Client disconnected: ${socket.id}`);
    // 사용자 연결 해제 시 userSockets 맵에서 제거
    this.userSockets.delete(socket.user.nickname);
  }
  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() socket: Socket & { user: UsersModel },
  ) {
    if (!data.roomId) {
      return;
    }
    socket.join(data.roomId);
    console.log(`Socket ${socket.id} joined room ${data.roomId}`);
    //join후에 채팅로그 불러오기
    //이제 채팅로그 싹 다 보내주면 안됨.
    //isPublic:true인 것들이랑
    //isPublic:false라면 sender나 receiver 중 유저와 일치하는 것만 불러와야함
    const chatLogs = await this.chatService.getChatLogs(
      +data.roomId,
      socket.user,
    );
    //해당 룸에만 채탕로그 보내주기
    this.server.to(data.roomId).emit('chat_history', chatLogs);

    //채팅방에 있는 멤버 목록 보내주기(귓속말 기능을 위해서)
    const roomInfoWithMembers = await this.chatRoomService.getChatRoomMembers(
      +data.roomId,
    );
    //클라에 보내주기 채팅방 정보와 함께
    this.server
      .to(data.roomId)
      .emit('room_info_with_members', roomInfoWithMembers);
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() data: any,
    @ConnectedSocket() socket: Socket & { user: UsersModel },
  ) {
    const savedMessage = await this.chatService.createChat(data, socket.user);
    console.log(savedMessage);
    await this.chatRoomService.updateChatRoomTime(data.roomId);
    if (data.receiver) {
      // 귓속말인 경우, receiver에게만 메시지를 보냄
      const receiverSocketId = this.userSockets.get(data.receiver);
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('message', savedMessage);
      }
      // sender도 볼 수 있게 sender에게도 메시지를 보냄
      console.log(socket.id);
      this.server.to(socket.id).emit('message', savedMessage);
    } else {
      // 공개 메시지인 경우, 방 전체에 메시지를 브로드캐스트
      this.server.to(data.roomId).emit('message', savedMessage);
    }
  }
}
