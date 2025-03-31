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

@Controller('posts')
export class PostsController {
  constructor(
    @Inject(BlogsService) protected blogsService: BlogsService,
    @Inject(PostsService) protected postsService: PostsService,
    @Inject(CommentsService) protected commentsService: CommentsService,
    @Inject(UsersService) protected usersService: UsersService,
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
  @UseGuards(AuthGuardBasicAuth)
  @Post()
  async createPost(@Body() body: CreatePostDto) {
    const newPost = await this.postsService.createNewPost(body);

    return newPost;
  }
  @UseGuards(AuthGuardBasicAuth)
  @Delete(':id')
  @HttpCode(204)
  async deletePost(@Param('id') id: string) {
    return this.postsService.deletePostById(id);
  }
  @UseGuards(AuthGuardBasicAuth)
  @Put(':id')
  @HttpCode(204)
  async updatePost(@Param('id') id: string, @Body() body: CreatePostDto) {
    return this.postsService.updatePost(id, body);
  }
  @UseGuards(JwtAuthGuardWithoutError)
  @Get(':id/comments')
  async getCommentsByPostId(
    @Query() query: GetPostsQueryParams,
    @Param('id') id: string,
    @ExtractUserFromRequest() user: UserCreateParamDecoratorContextDto,
  ) {
    const pageNumber = query.pageNumber ? +query.pageNumber : 1;
    const pageSize = query.pageSize ? +query.pageSize : 10;
    const sortBy = query.sortBy ? query.sortBy.toString() : 'createdAt';
    const sortDirection =
      query.sortDirection && query.sortDirection.toString() === 'asc'
        ? 'asc'
        : 'desc';
    const getPost = await this.postsService.findPostById(id, null);
    const allComments = await this.commentsService.getCommentsByPostId(
      getPost.id,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      user ? user.userId : null,
    );
    return allComments;
  }
  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  async postCommentByPostId(
    @Param('id') id: string,
    @Body() body: CreateCommentInputDto,
    @ExtractUserFromRequest() user: UserCreateParamDecoratorContextDto,
  ) {
    const getPost = await this.postsService.findPostById(id, null);
    const getUser = await this.usersService.findUserById(user.userId);
    return this.commentsService.createNewComment(body.content, id, getUser);
  }
  @UseGuards(JwtAuthGuard)
  @Put(':id/like-status')
  @HttpCode(204)
  async createLikeStatusForPost(
    @Param('id') id: string,
    @Body() body: CreateLikeStatusInputDto,
    @ExtractUserFromRequest() user: UserCreateParamDecoratorContextDto,
  ) {
    const getPost = await this.postsService.findPostById(id, null);
    return this.postsService.sendLikeStatus(id, user.userId, body.likeStatus);
  }
}
