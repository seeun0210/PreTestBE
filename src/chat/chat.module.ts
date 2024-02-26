import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatLog, ChatLogSchema } from './schema/chat-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ChatLog.name, schema: ChatLogSchema }]),
  ],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
