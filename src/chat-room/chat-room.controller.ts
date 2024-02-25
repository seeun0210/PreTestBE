import { Controller, UseGuards } from '@nestjs/common';
import { ChatRoomService } from './chat-room.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';

@Controller('chat-room')
@UseGuards(AccessTokenGuard)
export class ChatRoomController {
  constructor(private readonly chatRoomService: ChatRoomService) {}
}
