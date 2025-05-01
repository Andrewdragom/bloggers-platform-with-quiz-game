import {
  Controller,
  Get,
  Inject,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogsService } from '../application/blogs.service';
import { ExtractUserFromRequest } from '../../users-account/guards/bearer/decorators/extract-user-from-request';
import { UserCreateParamDecoratorContextDto } from '../../users-account/dto/user-create-param-decorator-context.dto';
import { JwtAuthGuardWithoutError } from '../../users-account/guards/bearer/jwt-auth-without-error.guard';
import { GetBlogsQueryDto } from './input-dto/dto-blogs/get-blogs-query-params-input.dto';
import { GetPostsQueryDto } from './input-dto/dto-posts/get-posts-query-params.dto';
import { Blog } from '../domain/blogs.schema';

@Controller('blogs')
export class PublicBlogsController {
  constructor(@Inject(BlogsService) private blogsService: BlogsService) {}
  @Get()
  async getBlogs(
    @Query()
    query: GetBlogsQueryDto,
  ) {
    return this.blogsService.findBlogs(
      query.pageNumber,
      query.pageSize,
      query.sortBy,
      query.sortDirection,
      query.searchNameTerm,
    );
  }
  @Get(':id')
  async getBlogById(@Param('id') id: string): Promise<Blog> {
    return await this.blogsService.findBlogById(id);
  }
  @UseGuards(JwtAuthGuardWithoutError)
  @Get(':id/posts')
  async getPostsByBlogId(
    @Param('id') id: string,
    @Query() query: GetPostsQueryDto,
    @ExtractUserFromRequest() user: UserCreateParamDecoratorContextDto | null,
  ) {
    const getBlog = await this.blogsService.findBlogById(id);

    const fondedPosts = await this.blogsService.findPostsByBlogId(
      getBlog.id,
      query.pageNumber,
      query.pageSize,
      query.sortBy,
      query.sortDirection,
      user ? user.userId : null,
    );
    return fondedPosts;
  }
}
