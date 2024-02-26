import { PickType } from '@nestjs/mapped-types';
import { ChatRoomModel } from '../entity/chat-room.entity';
import { IsPasswordRequired } from '../decorator/is-password-required.decorator';

export class CreateChatRoomDto extends PickType(ChatRoomModel, [
  'title',
  'description',
  'isPublic',
  //   'password',
]) {
  @IsPasswordRequired({
    message: '비공개 채팅방에서는 비밀번호가 필수입니다.',
  })
  password?: string;
}
