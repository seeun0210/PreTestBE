import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ChatRoomModel } from './entity/chat-room.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ChatRoomService {
  constructor(
    @InjectRepository(ChatRoomModel)
    private readonly ChatRoomRepository: Repository<ChatRoomModel>,
  ) {}

  //유저가 속한 채팅방 불러오기

  //채팅방 생성

  //채팅방 삭제(관리자만)
}
