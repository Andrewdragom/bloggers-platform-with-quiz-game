import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { LikeStatusRepository } from '../likes/like-status.repository';
import { CommentsRepository } from './comments.repository';

@Injectable()
export class CommentsService {
  constructor(
    @Inject(LikeStatusRepository)
    protected likeStatusRepository: LikeStatusRepository,
    @Inject(CommentsRepository)
    protected commentsRepository: CommentsRepository,
  ) {}
  async getCommentById(commentId: string, userId: string | null | undefined) {
    const foundComment =
      await this.commentsRepository.findCommentById(commentId);
    if (!foundComment)
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    const like = await this.likeStatusRepository.countLike(
      foundComment.id,
      'Like',
    );
    const disLike = await this.likeStatusRepository.countLike(
      foundComment.id,
      'Dislike',
    );
    let myStatus = 'None';
    if (userId) {
      const comment = await this.likeStatusRepository.getStatus(
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
    const foundComments = await this.commentsRepository.findCommentByPostId(
      id,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    );

    const filterComments2 = await Promise.all(
      foundComments.map(async (comment) => {
        let myStatus = 'None';
        const like = await this.likeStatusRepository.countLike(
          comment.id,
          'Like',
        );
        const disLike = await this.likeStatusRepository.countLike(
          comment.id,
          'Dislike',
        );
        if (userId) {
          const commentForStatus = await this.likeStatusRepository.getStatus(
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
      await this.commentsRepository.getCommentsCountForPost(id);

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
}
