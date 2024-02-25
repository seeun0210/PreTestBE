import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatRoomModel } from './entity/chat-room.entity';
import { UsersModel } from 'src/users/entities/users.entity';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ChatRoomService {
  constructor(
    @InjectRepository(ChatRoomModel)
    private readonly chatRoomRepository: Repository<ChatRoomModel>,
  ) {}

  async createChatRoom(user: UsersModel, createChatRoomDto: CreateChatRoomDto) {
    const { title, description, isPublic, password } = createChatRoomDto;

    if (!isPublic && !password) {
      throw new BadRequestException(
        '비공개 채팅방에서는 비밀번호가 필수입니다.',
      );
    }

    let chatRoomPassword = null;
    if (password) {
      // 비밀번호를 bcrypt를 사용하여 해싱
      const salt = await bcrypt.genSalt();
      chatRoomPassword = await bcrypt.hash(password, salt);
    }

    const chatRoomObject = this.chatRoomRepository.create({
      title,
      description,
      isPublic,
      password: chatRoomPassword,
      admin: user, // 채팅방 관리자 설정
      members: [user],
    });

    await this.chatRoomRepository.save(chatRoomObject);

    return chatRoomObject;
  }
}
