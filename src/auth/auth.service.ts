import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { HASH_ROUNDS, JWT_SECRET } from './const/auth.const';
import * as bcrypt from 'bcrypt';
import { UsersModel } from 'src/users/entities/users.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async registerWithEmail(user: RegisterUserDto) {
    //비밀번호 암호화
    const hash = await bcrypt.hash(user.password, HASH_ROUNDS);

    const newUser = await this.usersService.createUser({
      ...user,
      //암호화된 비밀번호로 저장
      password: hash,
    });
    return this.loginUser(newUser);
  }

  //로그인을 하기 위해서는 일단 email과 password로 base64인코딩된 BasicToken의 값을 받아서
  //다시 Email과 password로 바꾸고
  //검증을 해야한다.

  //먼저 헤더에서 Token의 값을 가져오자
  extractTokenFromHeader(header: string, isBearer: boolean) {
    const splitToken = header.split(' ');
    const prefix = isBearer ? 'Bearer' : 'Basic';

    if (splitToken.length !== 2 || splitToken[0] !== prefix) {
      //splitToken의 길이가 2가 아니거나 토큰을 분리한 값이 "Bearer"나 "Basic"이 아니면 문제가 있는 토큰임
      throw new UnauthorizedException('잘못된 토큰입니다!');
    }

    //사용할 토큰의 값은 분리한 뒷자리
    const token = splitToken[1];
    return token;
  }

  //이제 token의 값을 반환받았다.
  //그럼 토큰을 decode해야한다.
  decodeBasicToken(base64string: string) {
    const decoded = Buffer.from(base64string, 'base64').toString('utf8');
    //base64로 인코딩된 토큰을 디코딩하면
    //email:password형태가 된다.

    const split = decoded.split(':');

    if (split.length !== 2) {
      //split한 토큰의 길이가 2가 아니면 ㄷㄷ
      throw new UnauthorizedException('잘못된 유형의 토큰입니다.');
    }

    const email = split[0];
    const password = split[1];

    return { email, password };
  }

  //BasicToken값을 해독해서 email과 password를 받아왔다!
  //그럼 이제 로그인을 하자!
  async loginWithEmail(user: Pick<UsersModel, 'email' | 'password'>) {
    //로그인을 하기 위해서는 이메일을 가진 사용자가 있는지 확인한 후 해당 사용자의 비밀번호가 입력된 비밀번호를 hashing한 값과 일치하는 지 비교해야한다
    //authenticateWithEmailAndPassword함수에서 해당 로직을 처리할거다
    const existingUser = await this.authenticateWithEmailAndPassword(user);

    //인증이 되었다면 로그인을 한다.
    //이때, accessToken과 refreshToken을 반환한다.+nickname도 같이 보내주자
    return this.loginUser(existingUser);
  }

  async authenticateWithEmailAndPassword(
    user: Pick<UsersModel, 'email' | 'password'>,
  ) {
    //Email로 일치하는 유저를 가져오는 로직은 usersService에 추가한다.
    const existingUser = await this.usersService.getUserByEmail(user);

    //이메일로 찾아온 유저가 존재하지 않는다면,,,
    if (!existingUser) {
      throw new UnauthorizedException('존재하지 않는 사용자입니다.');
    }

    //여기까지 왔다면 비밀번호를 해싱해서 디비의 값과 비교해야한다.
    const passOK = bcrypt.compare(user.password, existingUser.password);

    if (!passOK) {
      throw new UnauthorizedException('비밀번호가 틀렸습니다!');
    }
    //여기까지 통과했다면 이제 인증이 된거다

    return existingUser;
  }

  loginUser(user: Pick<UsersModel, 'email' | 'id' | 'nickname'>) {
    return {
      accessToken: this.signToken(user, false),
      refreshToken: this.signToken(user, true),
      nickname: user.nickname,
    };
  }

  signToken(user: Pick<UsersModel, 'email' | 'id'>, isRefreshToken: boolean) {
    const payload = {
      email: user.email,
      sub: user.id,
      type: isRefreshToken ? 'refresh' : 'access',
    };
    return this.jwtService.sign(payload, {
      secret: JWT_SECRET,
      //리프레시 토큰이면 만료시간 길게, 엑세스는 짧게
      //리프레시 토큰으로 엑세스 토큰 갱신할것이기 때문
      expiresIn: isRefreshToken ? 3600 : 300,
    });
  }

  //토큰 검증
  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token, { secret: JWT_SECRET });
    } catch (e) {
      throw new UnauthorizedException('토큰이 만료되었거나 잘못된 토큰입니다');
    }
  }
}
