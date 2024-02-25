import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseInterceptors,
  Headers,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  postSignup(@Body() body: RegisterUserDto) {
    return this.authService.registerWithEmail(body);
  }

  @Post('signin')
  postSignin(@Headers('authorization') rawToken: string) {
    // console.log(rawToken);
    const token = this.authService.extractTokenFromHeader(rawToken, false);
    // console.log(token);
    const credentials = this.authService.decodeBasicToken(token);
    // console.log(credentials);
    return this.authService.loginWithEmail(credentials);
  }
}
