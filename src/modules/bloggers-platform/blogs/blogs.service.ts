import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BlogsRepository } from './blogs.repository';
import { PostsRepository } from '../posts/posts.repository';
import { Blog } from './blogs.schema';
import { CreateBlogDto } from './dto/create-blog.dto';
import { LikeStatusRepository } from '../likes/like-status.repository';

@Injectable()
export class BlogsService {
  constructor(
    @Inject(BlogsRepository) protected blogsRepository: BlogsRepository,
    @Inject(PostsRepository) protected postsRepository: PostsRepository,
    @Inject(LikeStatusRepository)
    protected likeStatusRepository: LikeStatusRepository,
  ) {}
  async findBlogs(
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    searchNameTerm: any,
  ) {
    const allBlogs = await this.blogsRepository.findBlogs(
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      searchNameTerm,
    );
    const filterBlogs = allBlogs.map((el) => {
      const blog = {
        id: el.id,
        name: el.name,
        description: el.description,
        websiteUrl: el.websiteUrl,
        createdAt: el.createdAt,
        isMembership: el.isMembership,
      };
      return blog;
    });
    const blogsCount = await this.blogsRepository.getBlogsCount(searchNameTerm);

    return {
      pagesCount: Math.ceil(blogsCount / pageSize),
      page: pageNumber,
      pageSize,
      totalCount: blogsCount,
      items: filterBlogs,
    };
  }
  async createNewBlog(body: CreateBlogDto) {
    const newBlog = Blog.createInstance(body);
    await this.blogsRepository.createNewBlog(newBlog);
    return newBlog;
  }
  async findBlogById(id: string | null | undefined) {
    const foundBlog = await this.blogsRepository.findBlogById(id);
    if (!foundBlog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
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
  async deleteBlogById(id: string | null) {
    const result = await this.blogsRepository.deleteBlogById(id);
    if (!result) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }
    return true;
  }
  async updateBlogById(id: string, body: CreateBlogDto) {
    const update = await this.blogsRepository.updateBlogById(
      id,
      body.name,
      body.description,
      body.websiteUrl,
    );
    if (!update) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }
    return true;
  }
  async findPostsByBlogId(
    id: string | null,
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    userId: string | null,
  ) {
    const foundPosts = await this.postsRepository.findPostsByBlogId(
      id,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    );

    const filterPosts = await Promise.all(
      foundPosts.map(async (el) => {
        const like = await this.likeStatusRepository.countLike(el.id, 'Like');
        const disLike = await this.likeStatusRepository.countLike(
          el.id,
          'Dislike',
        );
        let myStatus = 'None';
        if (userId) {
          const post = await this.likeStatusRepository.getStatus(el.id, userId);
          myStatus = post ? post!.likeStatus : myStatus;
        }
        const lastLike3 = await this.likeStatusRepository.getLast3Likes(el.id);
        // const filterLikes = await Promise.all(
        //   lastLike3.map(async (el) => {
        //     const userLogin = await usersService.findUserById(el.userId);
        //     const like = {
        //       addedAt: el.addedAt,
        //       userId: el.userId,
        //       login: userLogin?.login,
        //     };
        //     return like;
        //   }),
        // );

        const post = {
          id: el.id,
          title: el.title,
          shortDescription: el.shortDescription,
          content: el.content,
          blogId: el.blogId,
          blogName: el.blogName,
          createdAt: el.createdAt,
          extendedLikesInfo: {
            likesCount: like,
            dislikesCount: disLike,
            myStatus: myStatus,
            newestLikes: lastLike3,
          },
        };
        return post;
      }),
    );

    const postCount = await this.postsRepository.getPostsCountForBlog(id);

    return {
      pagesCount: Math.ceil(postCount / pageSize),
      page: pageNumber,
      pageSize,
      totalCount: postCount,
      items: filterPosts,
    };
  }
  // async findBlogById(id: string | null | undefined) {
  //   const foundBlog = await this.blogsRepository.findBlogById(id);
  //   if (!foundBlog) return null;
  //   const filterBlog = {
  //     id: foundBlog.id,
  //     name: foundBlog.name,
  //     description: foundBlog.description,
  //     websiteUrl: foundBlog.websiteUrl,
  //     createdAt: foundBlog.createdAt,
  //     isMembership: foundBlog.isMembership,
  //   };
  //   return filterBlog;
  // }
  // async createNewBlog(name: string, description: string, websiteUrl: string) {
  //   if (!description || !websiteUrl) return null;
  //
  //   const newBlog = new Blogs(
  //     (Date.now() + Math.random()).toString(),
  //     name,
  //     description,
  //     websiteUrl,
  //     new Date().toISOString(),
  //     false,
  //   );
  //   await this.blogsRepository.createNewBlog(newBlog);
  //   return newBlog;
  // }
  // async updateBlogById(
  //   id: string,
  //   name: string,
  //   description: string,
  //   websiteUrl: string,
  // ) {
  //   const update = await this.blogsRepository.updateBlogById(
  //     id,
  //     name,
  //     description,
  //     websiteUrl,
  //   );
  //   if (update) return true;
  //   else return false;
  // }
}
