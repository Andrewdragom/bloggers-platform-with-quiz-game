import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PostDocument } from './posts.schema';
import { Model } from 'mongoose';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel('posts') private postModel: Model<PostDocument>) {}
  async findPosts(
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
  ) {
    const allPosts = await this.postModel
      .find({})
      .skip((pageNumber - 1) * pageSize) // логика репозитория
      .limit(pageSize)
      .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 });
    return allPosts;
  }
  async getPostsCount() {
    return this.postModel.countDocuments({});
  }
  async findPostById(id: string | null | undefined) {
    const foundPost = await this.postModel.findOne({ id: id });
    return foundPost;
  }
  async createPost(post: object) {
    const result = await this.postModel.create({ ...post });
    return result;
  }
  async deletePostById(id: string | null | undefined) {
    const result = await this.postModel.deleteOne({ id: id });
    if (result.deletedCount === 1) return true;
    else return false;
  }
  async updatePostById(
    id: string | undefined | null,
    title: string,
    content: string,
    shortDescription: string,
    blogId: string,
    blogName: string,
  ) {
    const result = await this.postModel.updateOne(
      { id },
      {
        $set: {
          id: id,
          title: title,
          shortDescription: shortDescription,
          content: content,
          blogId: blogId,
          blogName: blogName,
        },
      },
    );
    if (result.matchedCount === 1) return true;
    else return false;
  }
  async findPostsByBlogId(
    id: string | null | undefined,
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
  ) {
    const foundPosts = await this.postModel
      .find({ blogId: id })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 });
    return foundPosts;
  }
  async getPostsCountForBlog(id: string | null | undefined) {
    return this.postModel.countDocuments({ blogId: id });
  }
  //   const allPosts = await postsCollection
  //     .find({})
  //     .skip((pageNumber - 1) * pageSize) // логика репозитория
  //     .limit(pageSize)
  //     .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
  //     .toArray();
  //   ///////////////////////
  //
  //   const filterPosts = await Promise.all(
  //     allPosts.map(async (el) => {
  //       const like = await likeStatusRepository.countLike(el.id, 'Like');
  //       const disLike = await likeStatusRepository.countLike(el.id, 'Dislike');
  //       let myStatus = 'None';
  //       if (userId) {
  //         const post = await likeStatusRepository.getStatus(el.id, userId);
  //         myStatus = post ? post!.likeStatus : myStatus;
  //       }
  //       const lastLike3 = await likeStatusRepository.getLast3Likes(el.id);
  //       const filterLikes = await Promise.all(
  //         lastLike3.map(async (el) => {
  //           const userLogin = await usersService.findUserById(el.userId);
  //           const like = {
  //             addedAt: el.addedAt,
  //             userId: el.userId,
  //             login: userLogin?.login,
  //           };
  //           return like;
  //         }),
  //       );
  //
  //       const post = {
  //         id: el.id,
  //         title: el.title,
  //         shortDescription: el.shortDescription,
  //         content: el.content,
  //         blogId: el.blogId,
  //         blogName: el.blogName,
  //         createdAt: el.createdAt,
  //         extendedLikesInfo: {
  //           likesCount: like,
  //           dislikesCount: disLike,
  //           myStatus: myStatus,
  //           newestLikes: filterLikes,
  //         },
  //       };
  //       return post;
  //     }),
  //   );
  //   ////////////////////////
  //   const postCount = await postsRepository.getPostsCount();
  //
  //   return {
  //     pagesCount: Math.ceil(postCount / pageSize),
  //     page: pageNumber,
  //     pageSize,
  //     totalCount: postCount,
  //     items: filterPosts,
  //   };
  // }
  // async findPostById(id: string | null | undefined, userId: string | null) {
  //   const foundPost = await postsCollection.findOne({ id: id });
  //   if (!foundPost) return null;
  //   const like = await likeStatusRepository.countLike(foundPost.id, 'Like');
  //   const disLike = await likeStatusRepository.countLike(
  //     foundPost.id,
  //     'Dislike',
  //   );
  //   let myStatus = 'None';
  //   if (userId) {
  //     const post = await likeStatusRepository.getStatus(foundPost.id, userId);
  //     myStatus = post ? post!.likeStatus : myStatus;
  //   }
  //
  //   const lastLike3 = await likeStatusRepository.getLast3Likes(foundPost.id);
  //
  //   const filterLikes = await Promise.all(
  //     lastLike3.map(async (el) => {
  //       const userLogin = await usersService.findUserById(el.userId);
  //       const like = {
  //         addedAt: el.addedAt,
  //         userId: el.userId,
  //         login: userLogin?.login,
  //       };
  //       return like;
  //     }),
  //   );
  //
  //   const filterPost = {
  //     id: foundPost.id,
  //     title: foundPost.title,
  //     shortDescription: foundPost.shortDescription,
  //     content: foundPost.content,
  //     blogId: foundPost.blogId,
  //     blogName: foundPost.blogName,
  //     createdAt: foundPost.createdAt,
  //     extendedLikesInfo: {
  //       likesCount: like,
  //       dislikesCount: disLike,
  //       myStatus: myStatus,
  //       newestLikes: filterLikes,
  //     },
  //   };
  //   return filterPost;
  // }
  // async findPostsByBlogId(
  //   id: string | null | undefined,
  //   pageNumber: number,
  //   pageSize: number,
  //   sortBy: string,
  //   sortDirection: string,
  // ) {
  //   const foundPosts = await postsCollection
  //     .find({ blogId: id })
  //     .skip((pageNumber - 1) * pageSize)
  //     .limit(pageSize)
  //     .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
  //     .toArray();
  //
  //   return foundPosts;
  // }

  // async deletePostById(id: string | null) {
  //   const result = await postsCollection.deleteOne({ id: id });
  //   if (result.deletedCount === 1) return true;
  //   else return false;
  // }
  // async createNewPost(
  //   title: string,
  //   shortDescription: string,
  //   content: string,
  //   blogId: string | null | undefined,
  // ) {
  //   let getBlog;
  //   if (blogId) {
  //     getBlog = await blogsCollection.findOne({ id: blogId });
  //   }
  //   if (!getBlog) return null;
  //   if (!title || !shortDescription || !content || !blogId) return null;
  //
  //   const newPost = {
  //     id: (Date.now() + Math.random()).toString(),
  //     title: title,
  //     shortDescription: shortDescription,
  //     content: content,
  //     blogId: blogId,
  //     blogName: getBlog.name,
  //     createdAt: new Date().toISOString(),
  //     extendedLikesInfo: {
  //       likesCount: 0,
  //       dislikesCount: 0,
  //       myStatus: 'None',
  //       newestLikes: [],
  //     },
  //   };
  //   const result = await postsCollection.insertOne({ ...newPost });
  //
  //   return newPost;
  // }
  // async updatePostById(
  //   id: string,
  //   getPost: object,
  //   title: string,
  //   shortDescription: string,
  //   content: string,
  //   blogId: string,
  // ) {
  //   let getBlog;
  //   if (blogId) {
  //     getBlog = await blogsCollection.findOne({ id: blogId });
  //   }
  //   if (!getBlog) return null;
  //
  //   const result = await postsCollection.updateOne(
  //     { id },
  //     {
  //       $set: {
  //         id: id,
  //         title: title,
  //         shortDescription: shortDescription,
  //         content: content,
  //         blogId: blogId,
  //         blogName: getBlog.name,
  //       },
  //     },
  //   );
  //   if (result.matchedCount === 1) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }
}
