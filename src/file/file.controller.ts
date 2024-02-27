import {
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { User } from 'src/users/decorator/user.decorator';
import { UsersModel } from 'src/users/entities/users.entity';
import path from 'path';

@Controller('file')
@UseGuards(AccessTokenGuard)
export class FileController {
  constructor(private readonly fileService: FileService) {}

  //파일 업로드하기
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @User() user: UsersModel,
  ) {
    // 파일을 서버의 지정된 위치에 저장 및 압축 해제
    const unzipDir = await this.fileService.saveAndUnzipFile(
      user.nickname,
      file,
    );

    // 압축 해제된 폴더의 구조를 분석 (필요한 경우)
    const structure = await this.fileService.analyzeStructure(unzipDir);
    console.log('structure::', structure);

    // 구조를 데이터베이스에 저장하는 로직 (구현 필요)
    // await this.fileService.saveFileStructure(structure);

    // 클라이언트에 성공 응답 전송
    return {
      message: 'File uploaded and processed successfully',
      unzipDir,
      structure,
    };
  }

  //유저별 파일 목록 가져오기
  @Get()
  async userFiles(@User() user: UsersModel) {
    return await this.fileService.getUsersFile(user.nickname);
  }

  @Get(':filename')
  async getFileContent(
    @User() user: UsersModel,
    @Param('filename') filename: string,
  ) {
    const filePath = path.join(__dirname, `uploads/${user.nickname}`, filename);
    const content = await this.fileService.readFile(filePath);
    return { content };
  }
}
