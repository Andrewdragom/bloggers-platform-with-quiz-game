import { Module } from '@nestjs/common';
import { BlogsController } from './blogs/blogs.controller';
import { BlogsService } from './blogs/blogs.service';
import { BlogsRepository } from './blogs/blogs.repository';
import { PostsRepository } from './posts/posts.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogSchema } from './blogs/blogs.schema';
import { PostsService } from './posts/posts.service';
import { PostSchema } from './posts/posts.schema';
import { LikeSchema } from './likes/likes.schema';
import { LikeStatusRepository } from './likes/like-status.repository';
import { PostsController } from './posts/posts.controller';
import { CommentSchema } from './comments/comments.schema';
import { CommentsController } from './comments/comments.controller';
import { CommentsService } from './comments/comments.service';
import { CommentsRepository } from './comments/comments.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'blogs',
        schema: BlogSchema,
      },
      {
        name: 'posts',
        schema: PostSchema,
      },
      {
        name: 'likeStatus',
        schema: LikeSchema,
      },
      {
        name: 'comments',
        schema: CommentSchema,
      },
    ]),
  ],
  controllers: [BlogsController, PostsController, CommentsController],
  providers: [
    BlogsService,
    BlogsRepository,
    PostsRepository,
    PostsService,
    LikeStatusRepository,
    CommentsService,
    CommentsRepository,
  ],
  exports: [
    MongooseModule.forFeature([
      {
        name: 'blogs',
        schema: BlogSchema,
      },
      {
        name: 'posts',
        schema: PostSchema,
      },
      {
        name: 'likeStatus',
        schema: LikeSchema,
      },
      {
        name: 'comments',
        schema: CommentSchema,
      },
    ]),
  ],
})
export class BloggersPlatformModule {}
