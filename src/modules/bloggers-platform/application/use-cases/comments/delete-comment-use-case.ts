import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, Inject, NotFoundException } from '@nestjs/common';
import { UsersRepositoryTypeOrm } from '../../../../users-account/infrastructure/users.repositoryTypeOrm';
import { CommentsRepositoryTypeOrm } from '../../../infrastructure/typeOrm/comments.repositoryTypeOrm';
import { CommentMapper } from '../../mappers/comment.mapper';
import { CommentsQueryRepositoryTypeOrm } from '../../../infrastructure/typeOrm/comments.queryRepositoryTypeOrm';

export class DeleteCommentCommand {
  constructor(
    public id: string,
    public userId: string,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(
    @Inject(UsersRepositoryTypeOrm)
    protected usersRepositoryTypeOrm: UsersRepositoryTypeOrm,
    @Inject(CommentsRepositoryTypeOrm)
    protected commentsRepositoryTypeOrm: CommentsRepositoryTypeOrm,
    @Inject(CommentsQueryRepositoryTypeOrm)
    protected commentsQueryRepositoryTypeOrm: CommentsQueryRepositoryTypeOrm,
  ) {}
  async execute(command: DeleteCommentCommand) {
    const getComment =
      await this.commentsQueryRepositoryTypeOrm.findCommentByIdForUpdate(
        command.id,
      );
    const getUser = await this.usersRepositoryTypeOrm.findUserByID(
      command.userId,
    );

    if (!getComment || !getUser) {
      throw new NotFoundException(`Comment with ID ${command.id} not found`);
    }
    if (getComment.userId != getUser.id) {
      throw new HttpException('', 403);
    }
    return await this.commentsRepositoryTypeOrm.deleteCommentById(
      getComment.id,
    );
  }
}
