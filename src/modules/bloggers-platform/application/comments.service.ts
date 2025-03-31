import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { LikeStatusRepository } from '../infrastructure/mongoDb/like-status.repository';
import { CommentsRepository } from '../infrastructure/mongoDb/comments.repository';
import { CommentsRepositoryPostgres } from '../infrastructure/postgres/comments.repositoryPostgres';
import { LikeStatusForCommentsRepositoryPostgres } from '../infrastructure/postgres/like-status-for-comments.repositoryPostgres';

@Injectable()
export class CommentsService {
  constructor(
    @Inject(LikeStatusRepository)
    protected likeStatusRepository: LikeStatusRepository,
    @Inject(CommentsRepository)
    protected commentsRepository: CommentsRepository,
    @Inject(CommentsRepositoryPostgres)
    protected commentsRepositoryPostgres: CommentsRepositoryPostgres,
    @Inject(LikeStatusForCommentsRepositoryPostgres)
    protected likeStatusForCommentsRepositoryPostgres: LikeStatusForCommentsRepositoryPostgres,
  ) {}
  async getCommentById(commentId: string, userId: string | null | undefined) {
    const foundComment =
      await this.commentsRepositoryPostgres.findCommentById(commentId);
    if (!foundComment)
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    const like = await this.likeStatusForCommentsRepositoryPostgres.countLike(
      foundComment.id,
      'Like',
    );
    const disLike =
      await this.likeStatusForCommentsRepositoryPostgres.countLike(
        foundComment.id,
        'Dislike',
      );
    let myStatus = 'None';
    if (userId) {
      const comment =
        await this.likeStatusForCommentsRepositoryPostgres.getStatus(
          foundComment.id,
          userId,
        );
      myStatus = comment ? comment!.likeStatus : myStatus;
    }

    const comment = {
      id: foundComment.id,
      content: foundComment.content,
      commentatorInfo: foundComment.commentatorInfo,
      createdAt: foundComment.createdAt,
      likesInfo: {
        likesCount: like,
        dislikesCount: disLike,
        myStatus: myStatus,
      },
    };
    return comment;
  }
  async getCommentsByPostId(
    id: string,
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    userId: string | null,
  ) {
    const foundComments =
      await this.commentsRepositoryPostgres.findCommentByPostId(
        id,
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
      );
    const filterComments2 = await Promise.all(
      foundComments.map(async (comment) => {
        let myStatus = 'None';
        const like =
          await this.likeStatusForCommentsRepositoryPostgres.countLike(
            comment.id,
            'Like',
          );
        const disLike =
          await this.likeStatusForCommentsRepositoryPostgres.countLike(
            comment.id,
            'Dislike',
          );
        if (userId) {
          const commentForStatus =
            await this.likeStatusForCommentsRepositoryPostgres.getStatus(
              comment.id,
              userId,
            );

          myStatus = commentForStatus ? commentForStatus!.likeStatus : myStatus;
        }
        const comments = {
          id: comment.id ? comment.id : 'None',
          content: comment.content ? comment.content : 'None',
          commentatorInfo: comment.commentatorInfo
            ? comment.commentatorInfo
            : 'None',
          createdAt: comment.createdAt ? comment.createdAt : 'None',
          likesInfo: {
            likesCount: like ? like : 0,
            dislikesCount: disLike ? disLike : 0,
            myStatus: myStatus ? myStatus : 'None',
          },
        };
        return comments;
      }),
    );
    const commentsCount =
      await this.commentsRepositoryPostgres.getCommentsCountForPost(id);

    return {
      pagesCount: Math.ceil(commentsCount / pageSize),
      page: pageNumber,
      pageSize,
      totalCount: commentsCount,
      items: filterComments2
        ? filterComments2
        : {
            id: 'None',
            content: 'None',
            commentatorInfo: 'None',
            createdAt: 'None',
            likesInfo: {
              likesCount: 0,
              dislikesCount: 0,
              myStatus: 'None',
            },
          },
    };
  }
  async createNewComment(content: string, postId: string, user: any) {
    if (!content || !user) return null;

    const newComment = {
      id: crypto.randomUUID(),
      content: content,
      commentatorInfo: {
        userId: user.userId,
        userLogin: user.login,
      },
      createdAt: new Date(),
      postId: postId,
    };
    await this.commentsRepositoryPostgres.createNewComment(newComment);
    return {
      id: newComment.id,
      content: newComment.content,
      commentatorInfo: newComment.commentatorInfo,
      createdAt: newComment.createdAt,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
      },
    };
  }
  async updateCommentById(id: string, content: string) {
    const update = await this.commentsRepositoryPostgres.updateCommentById(
      id,
      content,
    );
    if (!update) throw new NotFoundException(`Comment with ID ${id} not found`);
  }
  async deleteCommentById(id: string | null) {
    const result = await this.commentsRepositoryPostgres.deleteBlogById(id);
    if (result) return true;
    else return false;
  }
  async sendLikeStatus(id: string, userId: string, likeStatus: string) {
    const status = {
      commentId: id,
      userId: userId,
      likeStatus: likeStatus,
      addedAt: new Date().toISOString(),
    };
    const haveStatus =
      await this.likeStatusForCommentsRepositoryPostgres.getStatus(id, userId);
    if (!haveStatus) {
      const result =
        await this.likeStatusForCommentsRepositoryPostgres.saveStatus(status);
      return result;
    }
    const updateStatus =
      await this.likeStatusForCommentsRepositoryPostgres.updateStatus(
        id,
        likeStatus,
      );
    return updateStatus;
  }
}
