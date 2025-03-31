import { Module } from '@nestjs/common';
import { SuperAdminBlogsController } from './api/super-admin-blogs.controller';
import { BlogsService } from './application/blogs.service';
import { BlogsRepository } from './infrastructure/mongoDb/blogs.repository';
import { PostsRepository } from './infrastructure/mongoDb/posts.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogSchema } from './domain/blogs.schema';
import { PostsService } from './application/posts.service';
import { PostSchema } from './domain/posts.schema';
import { LikeSchema } from './domain/likes.schema';
import { LikeStatusRepository } from './infrastructure/mongoDb/like-status.repository';
import { PostsController } from './api/posts.controller';
import { CommentSchema } from './domain/comments.schema';
import { CommentsController } from './api/comments.controller';
import { CommentsService } from './application/comments.service';
import { CommentsRepository } from './infrastructure/mongoDb/comments.repository';
import { UserAccountModule } from '../users-account/user-account.module';
import { IsBlogIdExistConstraint } from './api/input-dto/dto-blogs/customValidators/IsBlogIdExist-custom-validator';
import { BlogsRepositoryPostgres } from './infrastructure/postgres/blogs.repositoryPostgres';
import { PostsRepositoryPostgres } from './infrastructure/postgres/posts.repositoryPostgres';
import { PublicBlogsController } from './api/public-blogs-controller';
import { CommentsRepositoryPostgres } from './infrastructure/postgres/comments.repositoryPostgres';
import { LikeStatusForCommentsRepositoryPostgres } from './infrastructure/postgres/like-status-for-comments.repositoryPostgres';
import { LikeStatusForPostsRepositoryPostgres } from './infrastructure/postgres/like-status-for-posts.repositoryPostgres';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from './domain/entities/blog.entity';
import { Post } from './domain/entities/post.entity';
import { BlogsRepositoryTypeOrm } from './infrastructure/typeOrm/blogs.repositoryTypeOrm';
import { CreateBlogUseCase } from './application/use-cases/blogs/create-blog-use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { BlogsQueryRepositoryTypeOrm } from './infrastructure/typeOrm/blogs.queryRepositoryTypeOrm';
import { BlogsMapper } from './application/mappers/blogs.mapper';
import { DeleteBlogUseCase } from './application/use-cases/blogs/delete-blog-use-case';
import { UpdateBlogUseCase } from './application/use-cases/blogs/update-blog-use-case';
import { PostRepositoryTypeOrm } from './infrastructure/typeOrm/posts.repositoryTypeOrm';
import { PostsMapper } from './application/mappers/posts.mapper';
import { CreatePostUseCase } from './application/use-cases/posts/create-post-use-case';
import { PostsQueryRepositoryTypeOrm } from './infrastructure/typeOrm/posts.queryRepositoryTypeOrm';
import { DeletePostUseCase } from './application/use-cases/posts/delete-post-use-case';
import { UpdatePostUseCase } from './application/use-cases/posts/update-post-use-case';

const CommandHandlers = [
  CreateBlogUseCase,
  DeleteBlogUseCase,
  UpdateBlogUseCase,
  CreatePostUseCase,
  DeletePostUseCase,
  UpdatePostUseCase,
];

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
    UserAccountModule,
    TypeOrmModule.forFeature([Blog, Post]),
    CqrsModule,
  ],
  controllers: [
    SuperAdminBlogsController,
    PostsController,
    CommentsController,
    PublicBlogsController,
  ],
  providers: [
    BlogsService,
    BlogsRepository,
    PostsRepository,
    PostsService,
    LikeStatusRepository,
    CommentsService,
    CommentsRepository,
    IsBlogIdExistConstraint,
    BlogsRepositoryPostgres,
    PostsRepositoryPostgres,
    CommentsRepositoryPostgres,
    LikeStatusForCommentsRepositoryPostgres,
    LikeStatusForPostsRepositoryPostgres,
    BlogsRepositoryTypeOrm,
    ...CommandHandlers,
    BlogsQueryRepositoryTypeOrm,
    BlogsMapper,
    PostRepositoryTypeOrm,
    PostsMapper,
    PostsQueryRepositoryTypeOrm,
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
