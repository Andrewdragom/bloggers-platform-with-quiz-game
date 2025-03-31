import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { CreatePostDto } from '../api/input-dto/dto-posts/create-post.dto';
import { CreatePostByBlogInputDto } from '../api/input-dto/dto-blogs/create-post-by-blog-input-dto';

export type PostDocument = HydratedDocument<Post>;

export class extendedLikesInfo {
  @Prop()
  likesCount: number;
  @Prop()
  dislikesCount: number;
  @Prop()
  myStatus: string;
  @Prop()
  newestLikes: [];
}
@Schema({ collection: 'posts' })
export class Post {
  @Prop()
  id: string;
  @Prop({
    required: true,
  })
  title: string;
  @Prop({
    required: true,
  })
  shortDescription: string;
  @Prop({
    required: true,
  })
  content: string;
  @Prop({
    required: true,
  })
  blogId: string;
  @Prop({
    required: true,
  })
  blogName: string;
  @Prop()
  createdAt: Date;
  @Prop()
  extendedLikesInfo: extendedLikesInfo;

  static createInstance(
    dto: CreatePostDto | CreatePostByBlogInputDto,
    getBlogId,
    getBlogName,
  ): PostDocument {
    const post = new Post();
    post.id = crypto.randomUUID();
    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = getBlogId;
    post.blogName = getBlogName;
    post.createdAt = new Date();
    post.extendedLikesInfo = {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None',
      newestLikes: [],
    };

    return post as PostDocument;
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);
