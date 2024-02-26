import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

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
  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer()
  server: Server;

  afterInit(server: any) {
    // throw new Error('Method not implemented.');
  }
  handleConnection(socket: Socket, ...args: any[]) {
    console.log(`Client connected: ${socket.id}`);
    // 클라이언트가 연결될 때 필요한 로직을 여기에 추가할 수 있습니다.
    const headers = socket.handshake.headers;

    const rawToken = headers['authorization'];

    if (!rawToken) {
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    console.log(`Client disconnected: ${socket.id}`);
    // 클라이언트가 연결을 끊을 때 필요한 로직을 여기에 추가할 수 있습니다.
  }
}
