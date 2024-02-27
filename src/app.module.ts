import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { UsersModel } from './users/entities/users.entity';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ChatRoomModule } from './chat-room/chat-room.module';
import { ChatRoomModel } from './chat-room/entity/chat-room.entity';
import { ChatModule } from './chat/chat.module';
import { FileModule } from './file/file.module';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/groom'),
    TypeOrmModule.forRoot({
      // 데이터 베이스 타입
      type: 'postgres',
      host: '127.0.0.1',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'groomPreTest',
      entities: [UsersModel, ChatRoomModel],
      //개발환경에서는 true
      //production한경에서는 false
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    CommonModule,
    ChatRoomModule,
    ChatModule,
    FileModule,
    ServeStaticModule.forRoot({
      //4022.jpg
      //http://loacalhost:3000/public/posts/4022.jpg
      // rootPath: PUBLIC_FOLDER_PATH,
      // serveRoot: '/public',
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
  ],
})
export class AppModule {}
