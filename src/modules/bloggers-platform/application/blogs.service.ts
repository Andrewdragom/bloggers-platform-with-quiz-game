import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BlogsRepository } from '../infrastructure/mongoDb/blogs.repository';
import { PostsRepository } from '../infrastructure/mongoDb/posts.repository';
import { CreateBlogDto } from '../api/input-dto/dto-blogs/create-blog.dto';
import { LikeStatusRepository } from '../infrastructure/mongoDb/like-status.repository';
import { UsersService } from '../../users-account/application/users.service';
import { BlogsRepositoryPostgres } from '../infrastructure/postgres/blogs.repositoryPostgres';
import { PostsRepositoryPostgres } from '../infrastructure/postgres/posts.repositoryPostgres';
import { LikeStatusForPostsRepositoryPostgres } from '../infrastructure/postgres/like-status-for-posts.repositoryPostgres';
import { BlogsRepositoryTypeOrm } from '../infrastructure/typeOrm/blogs.repositoryTypeOrm';
import { BlogsQueryRepositoryTypeOrm } from '../infrastructure/typeOrm/blogs.queryRepositoryTypeOrm';
import { Blog } from '../domain/blogs.schema';
import { BlogsMapper } from './mappers/blogs.mapper';
import { PostsQueryRepositoryTypeOrm } from '../infrastructure/typeOrm/posts.queryRepositoryTypeOrm';
import { PostsMapper } from './mappers/posts.mapper';
import { PaginatedBlogsResponse } from '../types/paginated-blogsResponse.types';

@Injectable()
export class BlogsService {
  constructor(
    @Inject(BlogsRepository) protected blogsRepository: BlogsRepository,
    @Inject(PostsRepository) protected postsRepository: PostsRepository,
    @Inject(LikeStatusRepository)
    protected likeStatusRepository: LikeStatusRepository,
    @Inject(UsersService) protected usersService: UsersService,
    @Inject(BlogsRepositoryPostgres)
    protected blogsRepositoryPostgres: BlogsRepositoryPostgres,
    @Inject(PostsRepositoryPostgres)
    protected postsRepositoryPostgres: PostsRepositoryPostgres,
    @Inject(LikeStatusForPostsRepositoryPostgres)
    protected likeStatusForPostsRepositoryPostgres: LikeStatusForPostsRepositoryPostgres,
    @Inject(BlogsRepositoryTypeOrm)
    protected blogsRepositoryTypeOrm: BlogsRepositoryTypeOrm,
    @Inject(BlogsQueryRepositoryTypeOrm)
    protected blogsQueryRepositoryTypeOrm: BlogsQueryRepositoryTypeOrm,
    @Inject(BlogsMapper) protected blogsMapper: BlogsMapper,
    @Inject(PostsQueryRepositoryTypeOrm)
    protected postsQueryRepositoryTypeOrm: PostsQueryRepositoryTypeOrm,
    @Inject(PostsMapper) protected postsMapper: PostsMapper,
  ) {}

  async findBlogs(
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    searchNameTerm: any,
  ): Promise<PaginatedBlogsResponse> {
    const allBlogs = await this.blogsQueryRepositoryTypeOrm.findBlogs(
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      searchNameTerm,
    );
    const blogsCount =
      await this.blogsQueryRepositoryTypeOrm.getBlogsCount(searchNameTerm);

    return {
      pagesCount: Math.ceil(blogsCount / pageSize),
      page: pageNumber,
      pageSize,
      totalCount: blogsCount,
      items: this.blogsMapper.toViewAfterGetAllBlogs(allBlogs),
    };
  }

  async findBlogById(id: string | null | undefined): Promise<Blog> {
    const foundBlog = await this.blogsQueryRepositoryTypeOrm.findBlogById(id);
    if (!foundBlog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }
    return this.blogsMapper.toViewAfterCreate(foundBlog);
  }

  async findBlogByIdForValid(id: string | null | undefined) {
    const foundBlog = await this.blogsRepositoryPostgres.findBlogById(id);
    if (!foundBlog) {
      return null;
    }
    const filterBlog = {
      id: foundBlog.id,
      name: foundBlog.name,
      description: foundBlog.description,
      websiteUrl: foundBlog.websiteUrl,
      createdAt: foundBlog.createdAt,
      isMembership: foundBlog.isMembership,
    };
    return filterBlog;
  }

  async findPostsByBlogId(
    id: string | null,
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    userId: string | null,
  ) {
    const getBlog = await this.blogsQueryRepositoryTypeOrm.findBlogById(id);
    if (!getBlog) throw new NotFoundException(`Blog with ID ${id} not found`);

    const foundPosts = await this.postsQueryRepositoryTypeOrm.findPostsByBlogId(
      id,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    );

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
    // const filterPosts = await Promise.all(
    //   foundPosts.map(async (el) => {
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
    //       blogId: el.blog.id,
    //       blogName: el.blog.name,
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

    const postCount =
      await this.postsQueryRepositoryTypeOrm.getPostsCountForBlog(id);

    return {
      pagesCount: Math.ceil(postCount / pageSize),
      page: pageNumber,
      pageSize,
      totalCount: postCount,
      items: filterPosts,
    };
  }
}
