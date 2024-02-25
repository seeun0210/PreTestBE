import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ChatRoomModel } from './entity/chat-room.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersModel } from 'src/users/entities/users.entity';

@Injectable()
export class ChatRoomService {
  constructor(
    @InjectRepository(ChatRoomModel)
    private readonly chatRoomRepository: Repository<ChatRoomModel>,
  ) {}

  //채팅방 생성

  //채팅방 삭제(관리자만)
}
