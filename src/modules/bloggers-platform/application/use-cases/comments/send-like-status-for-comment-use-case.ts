import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UsersRepositoryTypeOrm } from '../../../../users-account/infrastructure/users.repositoryTypeOrm';
import { CommentsRepositoryTypeOrm } from '../../../infrastructure/typeOrm/comments.repositoryTypeOrm';
import { CommentsQueryRepositoryTypeOrm } from '../../../infrastructure/typeOrm/comments.queryRepositoryTypeOrm';
import { LikesForComment } from '../../../domain/entities/likeForComment.entity';
import { LikeStatusForCommentsQueryRepositoryTypeOrm } from '../../../infrastructure/typeOrm/likeStatusForComments.queryRepositoryTypeOrm';
import { LikeStatusForCommentsRepositoryTypeOrm } from '../../../infrastructure/typeOrm/likeStatusForComments.repositoryTypeOrm';

export class SendLikeStatusForCommentCommand {
  constructor(
    public id: string,
    public userId: string,
    public likeStatus: string,
  ) {}
}

@CommandHandler(SendLikeStatusForCommentCommand)
export class SendLikeStatusForCommentUseCase
  implements ICommandHandler<SendLikeStatusForCommentCommand>
{
  constructor(
    @Inject(CommentsQueryRepositoryTypeOrm)
    protected commentsQueryRepositoryTypeOrm: CommentsQueryRepositoryTypeOrm,
    @Inject(UsersRepositoryTypeOrm)
    protected usersRepositoryTypeOrm: UsersRepositoryTypeOrm,
    @Inject(CommentsRepositoryTypeOrm)
    protected commentsRepositoryTypeOrm: CommentsRepositoryTypeOrm,
    @Inject(LikeStatusForCommentsQueryRepositoryTypeOrm)
    protected likeStatusForCommentsQueryRepositoryTypeOrm: LikeStatusForCommentsQueryRepositoryTypeOrm,
    @Inject(LikeStatusForCommentsRepositoryTypeOrm)
    protected likeStatusForCommentsRepositoryTypeOrm: LikeStatusForCommentsRepositoryTypeOrm,
  ) {}

  async execute(command: SendLikeStatusForCommentCommand) {
    const getComment =
      await this.commentsQueryRepositoryTypeOrm.findCommentById(command.id);
    if (!getComment)
      throw new NotFoundException(`Blog with ID ${command.id} not found`);
    const haveStatus =
      await this.likeStatusForCommentsQueryRepositoryTypeOrm.getStatus(
        command.id,
        command.userId,
      );
    if (!haveStatus) {
      const status = LikesForComment.createInstanceLikeStatus(
        command.id,
        command.userId,
        command.likeStatus,
      );

      return await this.likeStatusForCommentsRepositoryTypeOrm.saveStatus(
        status,
      );
    }
    haveStatus.updateStatus(command.likeStatus);
    await this.likeStatusForCommentsRepositoryTypeOrm.saveStatus(haveStatus);
    return haveStatus;
  }
}
