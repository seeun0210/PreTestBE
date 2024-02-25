import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //cors설정
  app.enableCors();
  await app.listen(8000);
}
bootstrap();
