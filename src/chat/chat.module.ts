import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatLog, ChatLogSchema } from './schema/chat-log.schema';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { ChatRoomService } from 'src/chat-room/chat-room.service';
import { ChatRoomModule } from 'src/chat-room/chat-room.module';

@Module({
  imports: [
    JwtModule.register({}),
    MongooseModule.forFeature([{ name: ChatLog.name, schema: ChatLogSchema }]),
    AuthModule,
    UsersModule,
    ChatRoomModule,
  ],
  providers: [ChatGateway, ChatService, AuthService],
})
export class ChatModule {}
