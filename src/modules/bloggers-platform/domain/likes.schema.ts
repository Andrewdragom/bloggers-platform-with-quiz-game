import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LikeDocument = HydratedDocument<Like>;

@Schema({ collection: 'likeStatus' })
export class Like {
  @Prop()
  commentId: string;
  @Prop()
  userId: string;
  @Prop()
  likeStatus: string;
  @Prop()
  addedAt: Date;
}

export const LikeSchema = SchemaFactory.createForClass(Like);
