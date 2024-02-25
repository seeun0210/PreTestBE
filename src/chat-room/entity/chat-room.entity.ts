import { IsBoolean, IsString, Length } from 'class-validator';
import { BaseModel } from 'src/common/entity/base.entity';
import { lengthValidationMessage } from 'src/common/validation-message/length-validation.message';
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message';
import { UsersModel } from 'src/users/entities/users.entity';
import { Column, Entity, ManyToMany, ManyToOne } from 'typeorm';

@Entity()
export class ChatRoomModel extends BaseModel {
  @Column({
    length: 10,
  })
  @IsString({ message: stringValidationMessage })
  @Length(3, 10, { message: lengthValidationMessage })
  title: string;

  @Column({
    length: 250,
  })
  @IsString({ message: stringValidationMessage })
  @Length(1, 250, { message: lengthValidationMessage })
  description: string;

  @Column()
  @IsBoolean({ message: 'true or false만 가능합니다.' })
  isPublic: boolean;

  @ManyToMany(() => UsersModel, (user) => user.chatRooms)
  members: UsersModel[];

  @ManyToOne(() => UsersModel, (user) => user.managedChatRooms)
  admin: UsersModel;
}
