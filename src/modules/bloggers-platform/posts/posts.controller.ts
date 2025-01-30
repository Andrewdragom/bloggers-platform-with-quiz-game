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
import { BlogsService } from '../blogs/blogs.service';
import { GetPostsQueryParams } from './dto/get-posts-query-params.dto';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CommentsService } from '../comments/comments.service';

@Controller('posts')
export class PostsController {
  constructor(
    @Inject(BlogsService) protected blogsService: BlogsService,
    @Inject(PostsService) protected postsService: PostsService,
    @Inject(CommentsService) protected commentsService: CommentsService,
  ) {}
  @Get()
  async getPosts(@Query() query: GetPostsQueryParams) {
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

    const allPosts = await this.postsService.findPosts(
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      null,
      // userId ? userId!.userId : null,
    );
    return allPosts;
  }
  @Get(':id')
  async getPostByid(@Param('id') id: string) {
    let userId;
    // if (req.headers.authorization) {
    //   const token = req.headers.authorization.split(' ')[1];
    //   userId = await jwtService.getUserIdByToken(token);
    // }
    const getPost = await this.postsService.findPostById(
      id,
      userId ? userId!.userId : null,
    );
    return getPost;
  }
  @Post()
  async createPost(@Body() body: CreatePostDto) {
    const newPost = await this.postsService.createNewPost(body);

    return newPost;
  }
  @Delete(':id')
  @HttpCode(204)
  async deletePost(@Param('id') id: string) {
    return this.postsService.deletePostById(id);
  }
  @Put(':id')
  @HttpCode(204)
  async updatePost(@Param('id') id: string, @Body() body: CreatePostDto) {
    return this.postsService.updatePost(id, body);
  }
  @Get(':id/comments')
  async getCommentsByPostId(
    @Query() query: GetPostsQueryParams,
    @Param('id') id: string,
  ) {
    const pageNumber = query.pageNumber ? +query.pageNumber : 1;
    const pageSize = query.pageSize ? +query.pageSize : 10;
    const sortBy = query.sortBy ? query.sortBy.toString() : 'createdAt';
    const sortDirection =
      query.sortDirection && query.sortDirection.toString() === 'asc'
        ? 'asc'
        : 'desc';
    // let userId;
    // if(req.headers.authorization){
    //   const token = req.headers.authorization.split(' ')[1]
    //   userId = await jwtService.getUserIdByToken(token)
    const getPost = await this.postsService.findPostById(id, null);

    const allComments = await this.commentsService.getCommentsByPostId(
      getPost.id,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      null,
      // userId ? userId!.userId : null,
    );
    return allComments;
  }
}
