import { Module } from '@nestjs/common';
import { ChatRoomService } from './chat-room.service';
import { ChatRoomController } from './chat-room.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoomModel } from './entity/chat-room.entity';
import { AuthService } from 'src/auth/auth.service';
import { AuthModule } from 'src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { CommonModule } from 'src/common/common.module';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([ChatRoomModel]),
    AuthModule,
    UsersModule,
    CommonModule,
  ],
  exports: [ChatRoomService],
  controllers: [ChatRoomController],
  providers: [ChatRoomService, AuthService],
})
export class ChatRoomModule {}
