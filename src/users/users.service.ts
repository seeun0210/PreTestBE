import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersModel } from './entities/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly usersRepository: Repository<UsersModel>,
  ) {}

  //회원가입시 사용할 로직
  async createUser(user: Pick<UsersModel, 'email' | 'nickname' | 'password'>) {
    const nicknameExists = await this.usersRepository.exists({
      where: { nickname: user.nickname },
    });
    if (nicknameExists) {
      throw new BadRequestException('이미 존재하는 nickname입니다!');
    }
    const emailExists = await this.usersRepository.exists({
      where: { email: user.email },
    });
    if (emailExists) {
      throw new BadRequestException(`${user.email}로 가입한 이력이 있습니다.`);
    }
    const userObject = this.usersRepository.create({
      nickname: user.nickname,
      email: user.email,
      password: user.password,
    });

    const newUser = await this.usersRepository.save(userObject);

    return newUser;
  }
}
