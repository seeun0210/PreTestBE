import {
  Body,
  Controller,
  Get,
  Headers,
  InternalServerErrorException,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { User } from 'src/users/decorator/user.decorator';
import { UsersModel } from 'src/users/entities/users.entity';
import * as path from 'path';
import * as fs from 'fs';

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

  @Get('content')
  async getFileContent(
    @Headers('x-filepath') filepath: string,
    @User() user: UsersModel,
  ) {
    console.log(filepath);
    // 첫 번째 디코딩: %25 등의 퍼센트 인코딩된 문자들을 실제 특수 문자로 변환
    const partiallyDecoded = decodeURIComponent(filepath);

    // 두 번째 디코딩: 나머지 퍼센트 인코딩 처리를 해제
    const fullyDecoded = decodeURIComponent(partiallyDecoded);

    console.log(fullyDecoded);
    const absoluteFilePath = path.resolve(
      process.cwd(), // 현재 작업 디렉토리를 기준으로 함
      'uploads', // 'be'를 제외한 경로로 'uploads'가 프로젝트 루트에 있다고 가정
      user.nickname,
      fullyDecoded,
    );

    console.log('파일의 절대경로', absoluteFilePath);
    const readFileResult = await this.fileService.readFile(absoluteFilePath);
    // console.log('readfileResult ::', readFileResult);
    return { readFileResult, fullyDecoded };
  }

  //파일 수정 저장(파일 덮어쓰기)
  @Put()
  async updateFile(
    @User() user: UsersModel,
    @Body('readFileResult') fileContent: string,
    @Body('fullyDecoded') filepath: string,
  ) {
    const absoluteFilePath = path.resolve(
      process.cwd(), // 현재 작업 디렉토리를 기준으로 함
      'uploads', // 'be'를 제외한 경로로 'uploads'가 프로젝트 루트에 있다고 가정
      user.nickname,
      filepath,
    );
    //해당 파일이 존재하는 부터 확인
    if (fs.existsSync(absoluteFilePath)) {
      //파일을 쓴다(덮어쓰기)
      try {
        console.log('파일 찾음!!');
        await this.fileService.writeFile(absoluteFilePath, fileContent);
        const result = await this.fileService.readFile(absoluteFilePath);
        return { readFileResult: result, fullyDecoded: filepath };
      } catch (e) {
        throw new InternalServerErrorException('파일 덮어쓰기 중 에러 발생');
      }
    }
  }
}
