import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { ChatRoomModel } from './entity/chat-room.entity';
import { UsersModel } from 'src/users/entities/users.entity';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import * as bcrypt from 'bcryptjs';
import { AddMemberDto } from './dto/add-member.dto';
import { ConfigService } from '@nestjs/config';
import { ENV_HASH_ROUNDS_KEY } from 'src/common/const/env-keys.const';

@Injectable()
export class ChatRoomService {
  constructor(
    @InjectRepository(ChatRoomModel)
    private readonly chatRoomRepository: Repository<ChatRoomModel>,
    private readonly configService: ConfigService,
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

      chatRoomPassword = await bcrypt.hash(
        password,
        parseInt(this.configService.get<string>(ENV_HASH_ROUNDS_KEY)),
      );
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
    console.log(isPublic, password);
    const existingChatRoom = await this.chatRoomRepository.findOne({
      where: { id },
      relations: ['members'], // 멤버 정보를 함께 불러옵니다.
    });

    if (!existingChatRoom) {
      throw new BadRequestException('존재하지 않는 채팅방입니다.');
    }
    // 비공개 채팅방이고 비밀번호가 제공된 경우, 비밀번호 일치 여부 확인
    if (!existingChatRoom.isPublic && password) {
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

  //검색 단어로 채팅방 찾기
  async searchChatRoomByTerm(term: string) {
    return await this.chatRoomRepository.find({
      where: [
        { title: ILike(`%${term}%`) }, // title 필드에서 term을 포함하는 레코드 검색
        { description: ILike(`%${term}%`) }, // description 필드에서 term을 포함하는 레코드 검색
      ],
    });
  }

  //채팅방 탈퇴
  async leaveMemberFromChatRoom(user: UsersModel, id: number) {
    //해당 채팅방이 있는지 확인
    const existingChatRoom = await this.chatRoomRepository.findOne({
      where: { id },
      relations: ['members'], // 멤버 정보를 함께 불러옵니다.
    });

    if (!existingChatRoom) {
      throw new BadRequestException('존재하지 않는 채팅방입니다.');
    }
    //먼저 해당 채팅방의 멤버가 맞는지 확인
    const isMember = existingChatRoom.members.some(
      (existingMember) => existingMember.id === user.id,
    );

    if (!isMember) {
      throw new BadRequestException('해당 채팅방의 멤버가 아닙니다.');
    }

    //여기까지 왔다면 탈퇴 시켜줌

    // 멤버를 채팅방에서 제거
    existingChatRoom.members = existingChatRoom.members.filter(
      (member) => member.id !== user.id,
    );

    // 변경사항 저장
    await this.chatRoomRepository.save(existingChatRoom);
  }

  //채팅방 멤버들 불러오기
  async getChatRoomMembers(id: number) {
    const chatRoomInfoWithMembers = await this.chatRoomRepository.findOne({
      where: { id },
      relations: ['members'],
    });
    console.log('==========', chatRoomInfoWithMembers);
    return chatRoomInfoWithMembers;
  }

  //채팅로그쌓일때 채팅방 업데이트
  async updateChatRoomTime(roomId: string) {
    await this.chatRoomRepository.update(roomId, { updatedAt: new Date() });
  }
}
