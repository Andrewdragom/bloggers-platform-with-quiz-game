import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PostsRepository } from '../infrastructure/mongoDb/posts.repository';
import { LikeStatusRepository } from '../infrastructure/mongoDb/like-status.repository';
import { CreatePostDto } from '../api/input-dto/dto-posts/create-post.dto';
import { BlogsRepository } from '../infrastructure/mongoDb/blogs.repository';
import { Post } from '../domain/posts.schema';
import { UsersService } from '../../users-account/application/users.service';
import { CreatePostByBlogInputDto } from '../api/input-dto/dto-blogs/create-post-by-blog-input-dto';
import { BlogsRepositoryPostgres } from '../infrastructure/postgres/blogs.repositoryPostgres';
import { PostsRepositoryPostgres } from '../infrastructure/postgres/posts.repositoryPostgres';
import { LikeStatusForPostsRepositoryPostgres } from '../infrastructure/postgres/like-status-for-posts.repositoryPostgres';
import { BlogsQueryRepositoryTypeOrm } from '../infrastructure/typeOrm/blogs.queryRepositoryTypeOrm';
import { PostsMapper } from './mappers/posts.mapper';
import { PostsQueryRepositoryTypeOrm } from '../infrastructure/typeOrm/posts.queryRepositoryTypeOrm';

@Injectable()
export class PostsService {
  constructor(
    @Inject(PostsRepository) protected postsRepository: PostsRepository,
    @Inject(LikeStatusRepository)
    protected likeStatusRepository: LikeStatusRepository,
    @Inject(BlogsRepository) protected blogsRepository: BlogsRepository,
    @Inject(UsersService) protected usersService: UsersService,
    @Inject(BlogsRepositoryPostgres)
    protected blogsRepositoryPostgres: BlogsRepositoryPostgres,
    @Inject(PostsRepositoryPostgres)
    protected postsRepositoryPostgres: PostsRepositoryPostgres,
    @Inject(LikeStatusForPostsRepositoryPostgres)
    protected likeStatusForPostsRepositoryPostgres: LikeStatusForPostsRepositoryPostgres,
    @Inject(BlogsQueryRepositoryTypeOrm)
    protected blogsQueryRepositoryTypeOrm: BlogsQueryRepositoryTypeOrm,
    @Inject(PostsMapper) protected postsMapper: PostsMapper,
    @Inject(PostsQueryRepositoryTypeOrm)
    protected postsQueryRepositoryTypeOrm: PostsQueryRepositoryTypeOrm,
  ) {}
  async findPosts(
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    userId: string | null,
  ) {
    const foundPosts = await this.postsQueryRepositoryTypeOrm.findPosts(
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    );
    // const filterPosts = await Promise.all(
    //   allPosts.map(async (el) => {
    //     const like = await this.likeStatusForPostsRepositoryPostgres.countLike(
    //       el.id,
    //       'Like',
    //     );
    //     const disLike =
    //       await this.likeStatusForPostsRepositoryPostgres.countLike(
    //         el.id,
    //         'Dislike',
    //       );
    //     let myStatus = 'None';
    //     if (userId) {
    //       const post =
    //         await this.likeStatusForPostsRepositoryPostgres.getStatus(
    //           el.id,
    //           userId,
    //         );
    //       myStatus = post ? post!.likeStatus : myStatus;
    //     }
    //     const lastLike3 =
    //       await this.likeStatusForPostsRepositoryPostgres.getLast3Likes(el.id);
    //     const filterLikes = await Promise.all(
    //       lastLike3.map(async (el) => {
    //         const userLogin = await this.usersService.findUserById(el.userId);
    //         const like = {
    //           addedAt: el.addedAt,
    //           userId: el.userId,
    //           login: userLogin?.login,
    //         };
    //         return like;
    //       }),
    //     );
    //
    //     const post = {
    //       id: el.id,
    //       title: el.title,
    //       shortDescription: el.shortDescription,
    //       content: el.content,
    //       blogId: el.blogId,
    //       blogName: el.blogName,
    //       createdAt: el.createdAt,
    //       extendedLikesInfo: {
    //         likesCount: like,
    //         dislikesCount: disLike,
    //         myStatus: myStatus,
    //         newestLikes: filterLikes,
    //       },
    //     };
    //     return post;
    //   }),
    // );
    const filterPosts = await Promise.all(
      foundPosts.map(async (el) => {
        return {
          id: el.id,
          title: el.title,
          shortDescription: el.shortDescription,
          content: el.content,
          blogId: el.blog.id,
          blogName: el.blog.name,
          createdAt: el.createdAt,
          extendedLikesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: 'None',
            newestLikes: [],
          },
        };
      }),
    );
    const postCount = await this.postsQueryRepositoryTypeOrm.getPostsCount();

    return {
      pagesCount: Math.ceil(postCount / pageSize),
      page: pageNumber,
      pageSize,
      totalCount: postCount,
      items: filterPosts,
    };
  }
  async findPostById(id: string | null | undefined, userId: string | null) {
    const foundPost = await this.postsQueryRepositoryTypeOrm.findPostById(id);
    if (!foundPost) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    // const like = await this.likeStatusForPostsRepositoryPostgres.countLike(
    //   foundPost.id,
    //   'Like',
    // );
    // const disLike = await this.likeStatusForPostsRepositoryPostgres.countLike(
    //   foundPost.id,
    //   'Dislike',
    // );
    // let myStatus = 'None';
    // if (userId) {
    //   const post = await this.likeStatusForPostsRepositoryPostgres.getStatus(
    //     foundPost.id,
    //     userId,
    //   );
    //   myStatus = post ? post!.likeStatus : myStatus;
    // }
    //
    // const lastLike3 =
    //   await this.likeStatusForPostsRepositoryPostgres.getLast3Likes(
    //     foundPost.id,
    //   );
    //
    // const filterLikes = await Promise.all(
    //   lastLike3.map(async (el) => {
    //     const userLogin = await this.usersService.findUserById(el.userId);
    //     const like = {
    //       addedAt: el.addedAt,
    //       userId: el.userId,
    //       login: userLogin?.login,
    //     };
    //     return like;
    //   }),
    // );

    return this.postsMapper.toViewAfterCreate(foundPost);
  }
  async createNewPost(body: CreatePostDto) {
    const getBlog = await this.blogsRepositoryPostgres.findBlogById(
      body.blogId,
    );
    if (!getBlog) return null;
    // if (!body.title || !body.shortDescription || !body.content) return null;
    const newPost = Post.createInstance(body, getBlog.id, getBlog.name);
    await this.postsRepositoryPostgres.createPost(newPost);
    return newPost;
  }
  async deletePostById(id: string | null | undefined) {
    const getBlog = await this.blogsQueryRepositoryTypeOrm.findBlogById(id);
    if (!getBlog) throw new NotFoundException(`Blog with ID ${id} not found`);

    const result = await this.postsRepositoryPostgres.deletePostById(id);
    if (!result) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }
    return true;
  }
  async updatePost(id: string | null | undefined, body: CreatePostDto) {
    const getBlog = await this.blogsRepositoryPostgres.findBlogById(
      body.blogId,
    );
    if (!getBlog)
      throw new NotFoundException(`Blog with ID ${body.blogId} not found`);

    const update = await this.postsRepository.updatePostById(
      id,
      body.title,
      body.content,
      body.shortDescription,
      body.blogId,
      getBlog.name,
    );
    if (!update) throw new NotFoundException(`Not update`);
  }
  async updatePostByBlogId(
    id: string | null | undefined,
    body: CreatePostByBlogInputDto,
    blogId: string,
  ) {
    const getBlog = await this.blogsRepositoryPostgres.findBlogById(blogId);
    if (!getBlog)
      throw new NotFoundException(`Blog with ID ${blogId} not found`);
    const getPost = await this.postsRepositoryPostgres.findPostById(id);
    if (!getPost)
      throw new NotFoundException(`Post with ID ${blogId} not found`);
    const update = await this.postsRepositoryPostgres.updatePostById(
      id,
      body.title,
      body.content,
      body.shortDescription,
      blogId,
      getBlog.name,
    );
    if (!update) throw new NotFoundException(`Not update`);
  }
  async sendLikeStatus(id: string, userId: string, likeStatus: string) {
    const status = {
      postId: id,
      userId: userId,
      likeStatus: likeStatus,
      addedAt: new Date().toISOString(),
    };
    const haveStatus =
      await this.likeStatusForPostsRepositoryPostgres.getStatus(id, userId);
    if (!haveStatus) {
      const result =
        await this.likeStatusForPostsRepositoryPostgres.saveStatus(status);
      return result;
    }
    const updateStatus =
      await this.likeStatusForPostsRepositoryPostgres.updateStatus(
        id,
        likeStatus,
      );
    return updateStatus;
  }
}
