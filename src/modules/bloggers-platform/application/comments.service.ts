import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CommentsRepositoryPostgres } from '../infrastructure/postgres/comments.repositoryPostgres';
import { LikeStatusForCommentsRepositoryPostgres } from '../infrastructure/postgres/like-status-for-comments.repositoryPostgres';
import { CommentsQueryRepositoryTypeOrm } from '../infrastructure/typeOrm/comments.queryRepositoryTypeOrm';
import { LikeStatusForCommentsQueryRepositoryTypeOrm } from '../infrastructure/typeOrm/likeStatusForComments.queryRepositoryTypeOrm';
import { PostsQueryRepositoryTypeOrm } from '../infrastructure/typeOrm/posts.queryRepositoryTypeOrm';

@Injectable()
export class CommentsService {
  constructor(
    @Inject(CommentsRepositoryPostgres)
    protected commentsRepositoryPostgres: CommentsRepositoryPostgres,
    @Inject(LikeStatusForCommentsRepositoryPostgres)
    protected likeStatusForCommentsRepositoryPostgres: LikeStatusForCommentsRepositoryPostgres,
    @Inject(CommentsQueryRepositoryTypeOrm)
    protected commentsQueryRepositoryTypeOrm: CommentsQueryRepositoryTypeOrm,
    @Inject(LikeStatusForCommentsQueryRepositoryTypeOrm)
    protected likeStatusForCommentsQueryRepositoryTypeOrm: LikeStatusForCommentsQueryRepositoryTypeOrm,
    @Inject(PostsQueryRepositoryTypeOrm)
    protected postsQueryRepositoryTypeOrm: PostsQueryRepositoryTypeOrm,
  ) {}
  async getCommentById(commentId: string, userId: string | null | undefined) {
    const foundComment =
      await this.commentsQueryRepositoryTypeOrm.findCommentById(commentId);
    if (!foundComment)
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    const like =
      await this.likeStatusForCommentsQueryRepositoryTypeOrm.countLike(
        foundComment.id,
        'Like',
      );
    const disLike =
      await this.likeStatusForCommentsQueryRepositoryTypeOrm.countLike(
        foundComment.id,
        'Dislike',
      );
    let myStatus = 'None';
    if (userId) {
      const comment =
        await this.likeStatusForCommentsQueryRepositoryTypeOrm.getStatus(
          foundComment.id,
          userId,
        );
      myStatus = comment ? comment!.likeStatus : myStatus;
    }

    return {
      id: foundComment.id,
      content: foundComment.content,
      commentatorInfo: {
        userId: foundComment.userId,
        userLogin: foundComment.userLogin,
      },
      createdAt: foundComment.createdAt,
      likesInfo: {
        likesCount: like,
        dislikesCount: disLike,
        myStatus: myStatus,
      },
    };
  }
  async getCommentsByPostId(
    id: string,
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    userId: string | null,
  ) {
    const getPost = await this.postsQueryRepositoryTypeOrm.findPostById(id);
    if (!getPost) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    const foundComments =
      await this.commentsQueryRepositoryTypeOrm.findCommentByPostId(
        id,
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
      );
    const filterComments2 = await Promise.all(
      foundComments.map(async (comment) => {
        let myStatus = 'None';
        // const like =
        //   await this.likeStatusForCommentsRepositoryPostgres.countLike(
        //     comment.id,
        //     'Like',
        //   );
        // const disLike =
        //   await this.likeStatusForCommentsRepositoryPostgres.countLike(
        //     comment.id,
        //     'Dislike',
        //   );
        if (userId) {
          const commentForStatus =
            await this.likeStatusForCommentsQueryRepositoryTypeOrm.getStatus(
              comment.id,
              userId,
            );

          myStatus = commentForStatus ? commentForStatus!.likeStatus : myStatus;
        }
        const comments = {
          id: comment.id,
          content: comment.content,
          commentatorInfo: {
            userId: comment.userId,
            userLogin: comment.userLogin,
          },
          createdAt: comment.createdAt,
          likesInfo: {
            dislikesCount: Number(comment.dislikesCount),
            likesCount: Number(comment.likesCount),
            myStatus: myStatus,
          },
        };
        return comments;
      }),
    );
    const commentsCount =
      await this.commentsQueryRepositoryTypeOrm.getCommentsCountForPost(id);

    return {
      pagesCount: Math.ceil(commentsCount / pageSize),
      page: pageNumber,
      pageSize,
      totalCount: commentsCount,
      items: filterComments2,
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
