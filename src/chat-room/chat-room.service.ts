import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatRoomModel } from './entity/chat-room.entity';
import { UsersModel } from 'src/users/entities/users.entity';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import * as bcrypt from 'bcrypt';
import { AddMemberDto } from './dto/add-member.dto';

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

  //채팅방에 멤버 추가
  async addMemberToChatRoom(
    id: number,
    member: UsersModel,
    chatRoomDto: AddMemberDto,
  ) {
    const { isPublic, password } = chatRoomDto;

    const existingChatRoom = await this.chatRoomRepository.findOne({
      where: { id },
      relations: ['members'], // 멤버 정보를 함께 불러옵니다.
    });

    if (!existingChatRoom) {
      throw new BadRequestException('존재하지 않는 채팅방입니다.');
    }
    // 비공개 채팅방이고 비밀번호가 제공된 경우, 비밀번호 일치 여부 확인
    if (!isPublic && !password) {
      const isPasswordMatch = await bcrypt.compare(
        password,
        existingChatRoom.password,
      );
      if (!isPasswordMatch) {
        throw new BadRequestException('비밀번호가 일치하지 않습니다.');
      }
    }

    // 해당 유저가 멤버로 이미 있는지 확인
    const isMemberAlreadyExists = existingChatRoom.members.some(
      (existingMember) => existingMember.id === member.id,
    );

    if (isMemberAlreadyExists) {
      throw new BadRequestException('해당 유저는 이미 이 채팅방의 멤버입니다.');
    }

    // 유저가 멤버로 없으면 멤버 추가 로직을 여기에 구현
    existingChatRoom.members.push(member);
    await this.chatRoomRepository.save(existingChatRoom);
  }
}
