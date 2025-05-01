// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { CommentsDocument } from '../../domain/comments.schema';
// import { Injectable } from '@nestjs/common';
//
// @Injectable()
// export class CommentsRepository {
//   constructor(
//     @InjectModel('comments') private commentsModel: Model<CommentsDocument>,
//   ) {}
//   async findCommentById(id: string | null | undefined) {
//     const foundComment = await this.commentsModel.findOne({ id: id });
//     return foundComment;
//   }
//   async findCommentByPostId(
//     id: string,
//     pageNumber: number,
//     pageSize: number,
//     sortBy: string,
//     sortDirection: string,
//   ) {
//     const allComments = await this.commentsModel
//       .find({ postId: id })
//       .skip((pageNumber - 1) * pageSize)
//       .limit(pageSize)
//       .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 });
//     return allComments;
//   }
//   async getCommentsCountForPost(id: string | null | undefined) {
//     return this.commentsModel.countDocuments({ postId: id });
//   }
//   async createNewComment(newComment: object) {
//     const result = await this.commentsModel.create({ ...newComment });
//     return result;
//   }
//   async updateCommentById(id: string, content: string) {
//     const result = await this.commentsModel.updateOne(
//       { id },
//       { $set: { id: id, content: content } },
//     );
//
//     if (result.matchedCount === 1) {
//       return true;
//     } else {
//       return false;
//     }
//   }
//   async deleteBlogById(id: string | null | undefined) {
//     const result = await this.commentsModel.deleteOne({ id: id });
//     if (result.deletedCount === 1) return true;
//     else return false;
//   }
// }
