import { Controller, Get, UseGuards } from '@nestjs/common';
import { ChatRoomService } from './chat-room.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { UsersService } from '../users/users.service';
import { User } from 'src/users/decorator/user.decorator';
import { UsersModel } from 'src/users/entities/users.entity';

@Controller('chat-room')
@UseGuards(AccessTokenGuard)
export class ChatRoomController {
  constructor(
    private readonly chatRoomService: ChatRoomService,
    private readonly usersService: UsersService,
  ) {}

  //유저가 속한 채팅방 목록 불러오기
  @Get()
  async getAllChatRoomsByUser(@User() user: UsersModel) {
    const userInfo = await this.usersService.getUserWithChatRooms(user);

    return { chatRooms: userInfo.chatRooms };
  }
}
