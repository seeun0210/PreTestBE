import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Headers } from '@nestjs/common';

@Injectable()
export class BasicTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    //요청객체가 들어와야함
    const req = context.switchToHttp().getRequest();

    // {authorization: "Basic asdfasdfasdf"}
    //asdfasdfasdf
    const rawToken = req.headers['authorization'];
    //headers 대괄호 주의!!!

    if (!rawToken) {
      throw new UnauthorizedException('토큰이 없습니다!');
    }

    const token = this.authService.extractTokenFromHeader(rawToken, false);

    const { email, password } = this.authService.decodeBasicToken(token);

    const user = await this.authService.authenticateWithEmailAndPassword({
      email,
      password,
    });

    //req는 요청이 끝날 때 까지 살아있기 때문에 응답으로 돌아갈 때까지 req.user라는 코드를 실행해 항상 가드에서 가져온 유저를 가져올 수 있다
    req.user = user;

    return true;
  }
}
