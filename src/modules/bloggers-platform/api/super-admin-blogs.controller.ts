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
import { CreateBlogDto } from './input-dto/dto-blogs/create-blog.dto';
import { PostsService } from '../application/posts.service';
import { AuthGuardBasicAuth } from '../../users-account/guards/basic/basic-auth.guard';
import { JwtAuthGuardWithoutError } from '../../users-account/guards/bearer/jwt-auth-without-error.guard';
import { ExtractUserFromRequest } from '../../users-account/guards/bearer/decorators/extract-user-from-request';
import { UserCreateParamDecoratorContextDto } from '../../users-account/dto/user-create-param-decorator-context.dto';
import { CreatePostByBlogInputDto } from './input-dto/dto-blogs/create-post-by-blog-input-dto';
import { BlogsViewDto } from './view-dto/dto-blogs/blogs-view.dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreateBlogCommand } from '../application/use-cases/blogs/create-blog-use-case';
import { GetBlogsQueryDto } from './input-dto/dto-blogs/get-blogs-query-params-input.dto';
import { GetPostsQueryDto } from './input-dto/dto-posts/get-posts-query-params.dto';
import { PaginatedBlogsResponse } from '../types/paginated-blogsResponse.types';
import { DeleteBlogCommand } from '../application/use-cases/blogs/delete-blog-use-case';
import { UpdateBlogCommand } from '../application/use-cases/blogs/update-blog-use-case';
import { CreatePostCommand } from '../application/use-cases/posts/create-post-use-case';
import { PostsViewDto } from './view-dto/dto-posts/posts-view.dto';
import { DeletePostCommand } from '../application/use-cases/posts/delete-post-use-case';
import { UpdatePostCommand } from '../application/use-cases/posts/update-post-use-case';
import { UpdatePostDto } from './input-dto/dto-posts/update-post.dto';

@Controller('sa/blogs')
export class SuperAdminBlogsController {
  constructor(
    @Inject(BlogsService) protected blogsService: BlogsService,
    @Inject(PostsService) protected postsService: PostsService,
    @Inject(CommandBus) protected commandBus: CommandBus,
  ) {}
  @UseGuards(AuthGuardBasicAuth)
  @Get()
  async getBlogs(
    @Query()
    query: GetBlogsQueryDto,
  ): Promise<PaginatedBlogsResponse> {
    return this.blogsService.findBlogs(
      query.pageNumber,
      query.pageSize,
      query.sortBy,
      query.sortDirection,
      query.searchNameTerm,
    );
  }
  @UseGuards(AuthGuardBasicAuth)
  @Post()
  async createBlog(@Body() body: CreateBlogDto): Promise<BlogsViewDto> {
    return await this.commandBus.execute(new CreateBlogCommand(body));
  }
  @UseGuards(AuthGuardBasicAuth)
  @Delete(':id')
  @HttpCode(204)
  async deleteBlogById(@Param('id') id: string): Promise<boolean> {
    return await this.commandBus.execute(new DeleteBlogCommand(id));
  }
  @UseGuards(AuthGuardBasicAuth)
  @Put(':id')
  @HttpCode(204)
  async updateBlogById(
    @Param('id') id: string,
    @Body() body: CreateBlogDto,
  ): Promise<BlogsViewDto> {
    return await this.commandBus.execute(new UpdateBlogCommand(body, id));
  }
  @UseGuards(JwtAuthGuardWithoutError)
  @Get(':id/posts')
  async getPostsByBlogId(
    @Param('id') id: string,
    @Query() query: GetPostsQueryDto,
    @ExtractUserFromRequest() user: UserCreateParamDecoratorContextDto,
  ) {
    return await this.blogsService.findPostsByBlogId(
      id,
      query.pageNumber,
      query.pageSize,
      query.sortBy,
      query.sortDirection,
      user ? user.userId : null,
    );
  }
  @UseGuards(AuthGuardBasicAuth)
  @Post(':id/posts')
  async createPostByBlogId(
    @Param('id') id: string,
    @Body() body: CreatePostByBlogInputDto,
  ): Promise<PostsViewDto> {
    return this.commandBus.execute(new CreatePostCommand(body, id));
  }
  @UseGuards(AuthGuardBasicAuth)
  @Delete(':blogId/posts/:postId')
  @HttpCode(204)
  async deletePostByBlogId(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
  ): Promise<boolean> {
    return this.commandBus.execute(new DeletePostCommand(postId, blogId));
  }
  @UseGuards(AuthGuardBasicAuth)
  @Put(':blogId/posts/:postId')
  @HttpCode(204)
  async updatePostByBlogId(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Body() body: UpdatePostDto,
  ) {
    return this.commandBus.execute(new UpdatePostCommand(postId, body, blogId));
  }
}
