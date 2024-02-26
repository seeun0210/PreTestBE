// chat-log.schema.ts (Mongoose Schema for MongoDB)
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

@Schema({ timestamps: true })
export class ChatLog extends Document {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  })
  _id: mongoose.Types.ObjectId;

  @Prop({
    type: Number,
  })
  room_id: number; //chatRoom의 id와 매핑

  @Prop({ type: String, required: true }) // 여기서는 User 엔티티 대신 문자열로 저장
  sender: string; // sender의 nickname

  @Prop({ type: String, default: null }) // receiver도 문자열로 저장
  receiver: string | null; // receiver의 nickname

  @Prop({ default: true })
  isPublic: boolean;
}

export const ChatLogSchema = SchemaFactory.createForClass(ChatLog);
