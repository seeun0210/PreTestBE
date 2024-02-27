import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import * as unzipper from 'unzipper';

@Injectable()
export class FileService {
  // 파일 저장 디렉토리
  private readonly uploadDir = './uploads';

  constructor() {
    // 저장 디렉토리가 없으면 생성
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveAndUnzipFile(
    userNickname: string,
    file: Express.Multer.File,
  ): Promise<string> {
    // 임시 디렉토리 경로 설정
    const tempDir = path.join(this.uploadDir, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // 임시 파일 경로
    const tempFilePath = path.join(tempDir, file.originalname);

    // 파일 저장
    if (file.buffer) {
      await fs.promises.writeFile(tempFilePath, file.buffer);
    }

    // 사용자 디렉토리 설정
    const userUploadDir = path.join(this.uploadDir, userNickname);
    if (!fs.existsSync(userUploadDir)) {
      fs.mkdirSync(userUploadDir, { recursive: true });
    }

    // 압축 해제 디렉토리 설정
    const unzipDir = path.join(
      userUploadDir,
      path.basename(file.originalname, path.extname(file.originalname)),
    );

    // 압축 해제
    await this.unzipFile(tempFilePath, unzipDir);

    // 임시 파일 삭제
    fs.unlink(tempFilePath, (err) => {
      if (err) {
        console.error('Error deleting temp file:', err);
      }
    });

    return unzipDir; // 압축 해제된 폴더 경로 반환
  }

  //   private async unzipFile(
  //     zipFilePath: string,
  //     destPath: string,
  //   ): Promise<void> {
  //     try {
  //       await fs
  //         .createReadStream(zipFilePath)
  //         .pipe(unzipper.Extract({ path: destPath }))
  //         .promise();
  //     } catch (error) {
  //       console.error('압축 해제 중 오류 발생:', error);
  //       throw new Error('압축 해제 실패');
  //     }
  //   }
  async unzipFile(zipFilePath: string, destPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.createReadStream(zipFilePath)
        .pipe(unzipper.Extract({ path: destPath }))
        .on('error', reject) // 에러 핸들링
        .on('finish', resolve); // 성공적으로 완료되면 resolve 호출
    });
  }

  // 파일 및 폴더 구조 분석
  async analyzeStructure(directory: string): Promise<any[]> {
    const entries = await fs.promises.readdir(directory, {
      withFileTypes: true,
    });
    const structure = [];

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        const subStructure = await this.analyzeStructure(fullPath);
        structure.push({
          name: entry.name,
          type: 'directory',
          children: subStructure,
        });
      } else if (entry.isFile()) {
        structure.push({ name: entry.name, type: 'file' });
      }
    }

    return structure;
  }

  async saveFileStructure(structure: any): Promise<void> {
    // 데이터베이스에 파일 및 폴더 구조 저장
    // 예: MongoDB, PostgreSQL 등의 데이터베이스 사용 가능
  }
  async readFile(filePath: string): Promise<string> {
    try {
      const content = await fs.promises.readFile(filePath, 'utf8');
      return content;
    } catch (error) {
      throw new NotFoundException('접근 불가능한 파일입니다!');
    }
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    await fs.promises.writeFile(filePath, content);
  }

  // FileService 내부에 추가
  async getUsersFile(userNickname: string): Promise<any[]> {
    const userUploadDir = path.join(this.uploadDir, userNickname);

    // 지정된 사용자 디렉토리가 존재하는지 확인
    if (!fs.existsSync(userUploadDir)) {
      fs.mkdirSync(userUploadDir, { recursive: true });
    }

    // 디렉토리 구조 분석
    return this.analyzeStructure(userUploadDir);
  }
}
