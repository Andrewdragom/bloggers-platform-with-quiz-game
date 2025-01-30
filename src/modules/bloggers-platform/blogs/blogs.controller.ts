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
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { GetBlogsQueryParams } from './dto/get-blogs-query-params-input.dto';
import { PostsService } from '../posts/posts.service';
import { CreatePostDto } from '../posts/dto/create-post.dto';

@Controller('blogs')
export class BlogsController {
  constructor(
    @Inject(BlogsService) protected blogsService: BlogsService,
    @Inject(PostsService) protected postsService: PostsService,
  ) {}

  @Get()
  async getBlogs(
    @Query()
    query: GetBlogsQueryParams,
  ) {
    const pageNumber = query.pageNumber ? +query.pageNumber : 1;
    const pageSize = query.pageSize ? +query.pageSize : 10;
    const sortBy = query.sortBy ? query.sortBy.toString() : 'createdAt';
    const sortDirection =
      query.sortDirection && query.sortDirection.toString() === 'asc'
        ? 'asc'
        : 'desc';
    const searchNameTerm = query.searchNameTerm ? query.searchNameTerm : null;

    return this.blogsService.findBlogs(
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      searchNameTerm,
    );
  }
  @Post()
  async createBlog(@Body() body: CreateBlogDto) {
    const newBlog = await this.blogsService.createNewBlog(body);
    return newBlog;
  }
  @Get(':id')
  async getBlogById(@Param('id') id: string) {
    return await this.blogsService.findBlogById(id);
  }
  @Delete(':id')
  @HttpCode(204)
  async deleteBlogById(@Param('id') id: string) {
    const deleteBlog = await this.blogsService.deleteBlogById(id);
    return deleteBlog;
  }
  @Put(':id')
  @HttpCode(204)
  async updateBlogById(@Param('id') id: string, @Body() body: CreateBlogDto) {
    return await this.blogsService.updateBlogById(id, body);
  }
  @Get(':id/posts')
  async getPostsByBlogId(
    @Param('id') id: string,
    @Query() query: GetBlogsQueryParams,
  ) {
    // let userId;
    // if (req.headers.authorization) {
    //   const token = req.headers.authorization.split(' ')[1];
    //   userId = await jwtService.getUserIdByToken(token);
    // }

    const pageNumber = query.pageNumber ? +query.pageNumber : 1;
    const pageSize = query.pageSize ? +query.pageSize : 10;
    const sortBy = query.sortBy ? query.sortBy.toString() : 'createdAt';
    const sortDirection =
      query.sortDirection && query.sortDirection.toString() === 'asc'
        ? 'asc'
        : 'desc';

    const getBlog = await this.blogsService.findBlogById(id);

    const fondedPosts = await this.blogsService.findPostsByBlogId(
      getBlog.id,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      null,
      // userId ? userId!.userId : null,
    );
    return fondedPosts;
  }
  @Post(':id/posts')
  async createPostByBlogId(
    @Param('id') id: string,
    @Body() body: CreatePostDto,
  ) {
    return this.postsService.createNewPostByBlogId(body, id);
  }
  // async deleteBlogById(req: Request, res: Response) {
  //   const deleteBlog = await this.blogsService.deleteBlogById(req.params.id);
  //   if (!deleteBlog) {
  //     res.send(404);
  //     return;
  //   }
  //   res.send(204);
  // }
  // async createBlog(req: Request, res: Response) {
  //   const newBlog = await this.blogsService.createNewBlog(
  //     req.body.name,
  //     req.body.description,
  //     req.body.websiteUrl,
  //   ); //db.inventory.insertOne()
  //   if (!newBlog) {
  //     res.status(400).json({});
  //     return;
  //   }
  //   res.status(201).json(newBlog);
  // }
  // async createPostByBlogId(req: Request, res: Response) {
  //   const newPost = await this.postsRepository.createNewPost(
  //     req.body.title,
  //     req.body.shortDescription,
  //     req.body.content,
  //     req.params.blogId,
  //   );
  //   if (!newPost) {
  //     res.status(404).json({});
  //     return;
  //   }
  //   res.status(201).json(newPost);
  // }
  // async updateBlogById(req: Request, res: Response) {
  //   if (
  //     await this.blogsService.updateBlogById(
  //       req.params.id,
  //       req.body.name,
  //       req.body.description,
  //       req.body.websiteUrl,
  //     )
  //   ) {
  //     res.status(204).json({});
  //     return;
  //   } else {
  //     res.status(404).send();
  //     return;
  //   }
  // }
  //
}
