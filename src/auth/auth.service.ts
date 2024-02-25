import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { HASH_ROUNDS } from './const/auth.const';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async registerWithEmail(user: RegisterUserDto) {
    //비밀번호 암호화
    const hash = await bcrypt.hash(user.password, HASH_ROUNDS);

    const newUser = await this.usersService.createUser({
      ...user,
      //암호화된 비밀번호로 저장
      password: hash,
    });
    return newUser;
  }
}
