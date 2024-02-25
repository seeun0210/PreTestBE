import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChatRoomService } from './chat-room.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { UsersService } from '../users/users.service';
import { User } from 'src/users/decorator/user.decorator';
import { UsersModel } from 'src/users/entities/users.entity';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { AddMemberDto } from './dto/add-member.dto';

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
    const userInfo = await this.usersService.getUserWithChatRooms(user.id);

    return { chatRooms: userInfo.chatRooms };
  }

  //채팅방 만들기
  @Post()
  async createChatRoom(
    @User() user: UsersModel,
    @Body() body: CreateChatRoomDto,
  ) {
    return await this.chatRoomService.createChatRoom(user, body);
  }

  //채팅방 멤버로 들어가기
  @Patch(':id')
  async addMember(
    @User() member: UsersModel,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: AddMemberDto,
  ) {
    console.log(member);
    return await this.chatRoomService.addMemberToChatRoom(id, member, body);
  }

  @Get('search')
  async searchChatRoom(@Query('term') term: string) {
    return await this.chatRoomService.searchChatRoomByTerm(term);
  }
}
