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
  //채팅로그 불러오기
  async getChatLogs(roomId: number, user: UsersModel) {
    // isPublic이 true이거나, isPublic이 false이면서 sender 또는 receiver가 현재 유저와 일치하는 경우
    return await this.chatLogModel.find({
      roomId: roomId,
      $or: [
        { isPublic: true }, // 공개 메시지
        {
          isPublic: false,
          $or: [
            { sender: user.nickname }, // 현재 유저가 보낸 비공개 메시지
            { receiver: user.nickname }, // 현재 유저가 받은 비공개 메시지
          ],
        },
      ],
    });
  }

  async createChat(data: any, user: UsersModel) {
    // console.log('여기는 chatService', data);
    const { message, roomId, receiver } = data;
    // console.log(message, roomId);
    const newChat = new this.chatLogModel({
      message,
      roomId,
      sender: user.nickname, // 예시: sender 필드에 사용자 닉네임 저장
    });

    //있으면
    if (receiver) {
      newChat.receiver = receiver; // 귓속말 대상
      newChat.isPublic = false; //귓속말임
    }
    // console.log(newChat);
    return await newChat.save();
    // console.log('****', savedChat);
  }
}
