import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type CommentsDocument = HydratedDocument<Comment>;

export class likesInfo {
  @Prop()
  likesCount: number;
  @Prop()
  dislikesCount: number;
  @Prop()
  myStatus: string;
}

export class commentatorInfo {
  @Prop()
  userId: string;
  @Prop()
  userLogin: string;
}

@Schema({ collection: 'comments' })
export class Comment {
  @Prop()
  id: string;
  @Prop()
  content: string;
  @Prop()
  commentatorInfo: commentatorInfo;
  @Prop()
  createdAt: Date;
  @Prop()
  likeInfo: likesInfo;
  @Prop()
  postId: string;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
