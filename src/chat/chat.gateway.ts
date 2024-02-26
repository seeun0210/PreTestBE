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

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000', // 클라이언트 애플리케이션의 호스트
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect
{
  constructor(
    private readonly chatService: ChatService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
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
    } catch (e) {
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    console.log(`Client disconnected: ${socket.id}`);
    // 클라이언트가 연결을 끊을 때 필요한 로직을 여기에 추가할 수 있습니다.
  }

  // @SubscribeMessage('join room')
  // joinRoom()

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() data: any,
    @ConnectedSocket() socket: Socket & { user: UsersModel },
  ) {
    console.log('메시지가 올까요??', data, socket.user); // 클라이언트에서 보낸 데이터 출력
    // 여기에서 받은 메시지를 처리하는 로직 구현
    await this.chatService.createChat(data, socket.user);
    // 예: 메시지 저장, 다른 클라이언트에 메시지 전송 등
  }
}
