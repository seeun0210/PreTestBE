import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatLog } from './schema/chat-log.schema';
import { UsersModel } from 'src/users/entities/users.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatLog.name) private chatLogModel: Model<ChatLog>,
  ) {}

  async createChat(data: any, user: UsersModel) {
    // console.log('여기는 chatService', data);
    const { message, roomId } = data;
    // console.log(message, roomId);
    const newChat = new this.chatLogModel({
      message,
      roomId,
      sender: user.nickname, // 예시: sender 필드에 사용자 닉네임 저장
    });
    // console.log(newChat);
    const savedChat = await newChat.save();
    console.log('****', savedChat);
  }
}