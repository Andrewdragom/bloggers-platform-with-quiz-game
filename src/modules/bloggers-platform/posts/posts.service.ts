import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { LikeStatusRepository } from '../likes/like-status.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { BlogsRepository } from '../blogs/blogs.repository';
import { Post } from './posts.schema';

@Injectable()
export class PostsService {
  constructor(
    @Inject(PostsRepository) protected postsRepository: PostsRepository,
    @Inject(LikeStatusRepository)
    protected likeStatusRepository: LikeStatusRepository,
    @Inject(BlogsRepository) protected blogsRepository: BlogsRepository,
  ) {}
  async findPosts(
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    userId: string | null,
  ) {
    const allPosts = await this.postsRepository.findPosts(
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    );

    const filterPosts = await Promise.all(
      allPosts.map(async (el) => {
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
    const postCount = await this.postsRepository.getPostsCount();

    return {
      pagesCount: Math.ceil(postCount / pageSize),
      page: pageNumber,
      pageSize,
      totalCount: postCount,
      items: filterPosts,
    };
  }
  async findPostById(id: string | null | undefined, userId: string | null) {
    const foundPost = await this.postsRepository.findPostById(id);
    if (!foundPost) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    const like = await this.likeStatusRepository.countLike(
      foundPost.id,
      'Like',
    );
    const disLike = await this.likeStatusRepository.countLike(
      foundPost.id,
      'Dislike',
    );
    let myStatus = 'None';
    if (userId) {
      const post = await this.likeStatusRepository.getStatus(
        foundPost.id,
        userId,
      );
      myStatus = post ? post!.likeStatus : myStatus;
    }

    const lastLike3 = await this.likeStatusRepository.getLast3Likes(
      foundPost.id,
    );

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

    const filterPost = {
      id: foundPost.id,
      title: foundPost.title,
      shortDescription: foundPost.shortDescription,
      content: foundPost.content,
      blogId: foundPost.blogId,
      blogName: foundPost.blogName,
      createdAt: foundPost.createdAt,
      extendedLikesInfo: {
        likesCount: like,
        dislikesCount: disLike,
        myStatus: myStatus,
        newestLikes: lastLike3,
      },
    };
    return filterPost;
  }
  async createNewPost(body: CreatePostDto) {
    const getBlog = await this.blogsRepository.findBlogById(body.blogId);
    if (!getBlog)
      throw new NotFoundException(`Blog with ID ${body.blogId} not found`);
    // if (!body.title || !body.shortDescription || !body.content) return null;
    const newPost = Post.createInstance(body, getBlog.id, getBlog.name);
    await this.postsRepository.createPost(newPost);
    return newPost;
  }
  async createNewPostByBlogId(body: CreatePostDto, blogId: string) {
    const getBlog = await this.blogsRepository.findBlogById(blogId);
    if (!getBlog)
      throw new NotFoundException(`Blog with ID ${blogId} not found`);
    // if (!body.title || !body.shortDescription || !body.content) return null;
    const newPost = Post.createInstance(body, getBlog.id, getBlog.name);
    await this.postsRepository.createPost(newPost);
    return newPost;
  }
  async deletePostById(id: string | null | undefined) {
    const result = await this.postsRepository.deletePostById(id);
    if (!result) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }
    return true;
  }
  async updatePost(id: string | null | undefined, body: CreatePostDto) {
    const getBlog = await this.blogsRepository.findBlogById(body.blogId);
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
}
