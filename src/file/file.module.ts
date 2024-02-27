import { BadRequestException, Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import { UsersModel } from 'src/users/entities/users.entity';
import { MulterModule } from '@nestjs/platform-express';
import { UsersService } from 'src/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([UsersModel]), //이거 없으면 가드 못씀
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/temp', // 임시 저장 폴더 지정
        filename: (req, file, callback) => {
          // 유저가 보낸 파일 이름 그대로 저장
          callback(null, file.originalname);
        },
      }),
      fileFilter: (req, file, callback) => {
        // .zip 파일과 .tar 파일만 허용
        if (!file.originalname.match(/\.(zip|tar)$/)) {
          return callback(
            new BadRequestException('파일형식은 .tar .zip 만 가능합니다!'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  ],
  controllers: [FileController],
  providers: [FileService, AuthService, UsersService],
})
export class FileModule {}
