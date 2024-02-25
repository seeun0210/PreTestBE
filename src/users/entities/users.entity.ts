import { Exclude } from 'class-transformer';
import { IsEmail, IsString, Length } from 'class-validator';
import { ChatRoomModel } from 'src/chat-room/entity/chat-room.entity';
import { BaseModel } from 'src/common/entity/base.entity';
import { lengthValidationMessage } from 'src/common/validation-message/length-validation.message';
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';

@Entity()
export class UsersModel extends BaseModel {
  @Column({
    length: 20,
    unique: true,
  })
  @IsString({ message: stringValidationMessage })
  @Length(1, 20, {
    message: lengthValidationMessage,
  })
  //닉네임의 길이는 1~20글자
  nickname: string;

  @Column({
    unique: true,
  })
  @IsEmail({}, { message: '올바르지 않은 이메일 형식입니다.' })
  email: string;

  @Column()
  @IsString({ message: stringValidationMessage })
  @Length(8, 15, { message: lengthValidationMessage })
  //비밀번호는 8~15글자(암호화 전)
  @Exclude({
    toPlainOnly: true,
  })
  //비밀번호는 응답값에서 제외
  password: string;

  @ManyToMany(() => ChatRoomModel, (chatRoom) => chatRoom.members)
  @JoinTable()
  chatRooms: ChatRoomModel[];
}
