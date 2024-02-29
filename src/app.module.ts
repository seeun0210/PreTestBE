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
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';
import {
  ENV_MONGO_DB_AUTHSOURCE_KEY,
  ENV_MONGO_DB_HOST_KEY,
  ENV_MONGO_DB_PASSWORD_KEY,
  ENV_MONGO_DB_PORT_KEY,
  ENV_MONGO_DB_USER_KEY,
  ENV_POSTGRES_DB_DATABASE_KEY,
  ENV_POSTGRES_DB_HOST_KEY,
  ENV_POSTGRES_DB_PASSWORD_KEY,
  ENV_POSTGRES_DB_PORT_KEY,
  ENV_POSTGRES_DB_USERNAME_KEY,
} from './common/const/env-keys.const';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    MongooseModule.forRoot(
      `mongodb://${process.env[ENV_MONGO_DB_USER_KEY]}:${process.env[ENV_MONGO_DB_PASSWORD_KEY]}@${process.env[ENV_MONGO_DB_HOST_KEY]}:${process.env[ENV_MONGO_DB_PORT_KEY]}/${process.env[ENV_MONGO_DB_PORT_KEY]}?authSource=${process.env[ENV_MONGO_DB_AUTHSOURCE_KEY]}`,
    ),
    TypeOrmModule.forRoot({
      // 데이터 베이스 타입
      type: 'postgres',
      host: process.env[ENV_POSTGRES_DB_HOST_KEY],
      port: parseInt(process.env[ENV_POSTGRES_DB_PORT_KEY]),
      username: process.env[ENV_POSTGRES_DB_USERNAME_KEY],
      password: process.env[ENV_POSTGRES_DB_PASSWORD_KEY],
      database: process.env[ENV_POSTGRES_DB_DATABASE_KEY],
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
