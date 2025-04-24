import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogsService } from '../application/blogs.service';
import {
  GetPostsQueryDto,
  GetPostsQueryParams,
} from './input-dto/dto-posts/get-posts-query-params.dto';
import { PostsService } from '../application/posts.service';
import { CreatePostDto } from './input-dto/dto-posts/create-post.dto';
import { CommentsService } from '../application/comments.service';
import { JwtAuthGuard } from '../../users-account/guards/bearer/jwt-auth.guard';
import { ExtractUserFromRequest } from '../../users-account/guards/bearer/decorators/extract-user-from-request';
import { UserCreateParamDecoratorContextDto } from '../../users-account/dto/user-create-param-decorator-context.dto';
import { CreateCommentInputDto } from './input-dto/dto-comments/create-comment-input.dto';
import { UsersService } from '../../users-account/application/users.service';
import { JwtAuthGuardWithoutError } from '../../users-account/guards/bearer/jwt-auth-without-error.guard';
import { CreateLikeStatusInputDto } from './input-dto/dto-likes/like-status-input.dto';
import { AuthGuardBasicAuth } from '../../users-account/guards/basic/basic-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { CreateCommentCommand } from '../application/use-cases/comments/create-comment-use-case';
import { SendLikeStatusForPostCommand } from '../application/use-cases/posts/send-like-status-for-post-use-case';

@Controller('posts')
export class PostsController {
  constructor(
    @Inject(BlogsService) protected blogsService: BlogsService,
    @Inject(PostsService) protected postsService: PostsService,
    @Inject(CommentsService) protected commentsService: CommentsService,
    @Inject(UsersService) protected usersService: UsersService,
    @Inject(CommandBus) protected commandBus: CommandBus,
  ) {}
  @UseGuards(JwtAuthGuardWithoutError)
  @Get()
  async getPosts(
    @ExtractUserFromRequest() user: UserCreateParamDecoratorContextDto,
    @Query() query: GetPostsQueryDto,
  ) {
    return await this.postsService.findPosts(
      query.pageNumber,
      query.pageSize,
      query.sortBy,
      query.sortDirection,
      user ? user.userId : null,
    );
  }
  @UseGuards(JwtAuthGuardWithoutError)
  @Get(':id')
  async getPostById(
    @Param('id') id: string,
    @ExtractUserFromRequest() user: UserCreateParamDecoratorContextDto,
  ) {
    return await this.postsService.findPostById(id, user ? user.userId : null);
  }

  @UseGuards(JwtAuthGuardWithoutError)
  @Get(':id/comments')
  async getCommentsByPostId(
    @Query() query: GetPostsQueryDto,
    @Param('id') id: string,
    @ExtractUserFromRequest() user: UserCreateParamDecoratorContextDto,
  ) {
    return await this.commentsService.getCommentsByPostId(
      id,
      query.pageNumber,
      query.pageSize,
      query.sortBy,
      query.sortDirection,
      user ? user.userId : null,
    );
  }
  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  async postCommentByPostId(
    @Param('id') id: string,
    @Body() body: CreateCommentInputDto,
    @ExtractUserFromRequest() user: UserCreateParamDecoratorContextDto,
  ) {
    return this.commandBus.execute(
      new CreateCommentCommand(body, id, user.userId),
    );
  }
  @UseGuards(JwtAuthGuard)
  @Put(':id/like-status')
  @HttpCode(204)
  async createLikeStatusForPost(
    @Param('id') id: string,
    @Body() body: CreateLikeStatusInputDto,
    @ExtractUserFromRequest() user: UserCreateParamDecoratorContextDto,
  ) {
    return this.commandBus.execute(
      new SendLikeStatusForPostCommand(id, user.userId, body.likeStatus),
    );
  }
  // @UseGuards(AuthGuardBasicAuth)
  // @Put(':id')
  // @HttpCode(204)
  // async updatePost(@Param('id') id: string, @Body() body: CreatePostDto) {
  //   return this.postsService.updatePost(id, body);
  // }
  // @UseGuards(AuthGuardBasicAuth)
  // @Delete(':id')
  // @HttpCode(204)
  // async deletePost(@Param('id') id: string) {
  //   return this.postsService.deletePostById(id);
  // }
  // @UseGuards(AuthGuardBasicAuth)
  // @Post()
  // async createPost(@Body() body: CreatePostDto) {
  //   return await this.postsService.createNewPost(body);
  // }
}
