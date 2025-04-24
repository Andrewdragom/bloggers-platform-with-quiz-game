import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { PostsQueryRepositoryTypeOrm } from '../../../infrastructure/typeOrm/posts.queryRepositoryTypeOrm';
import { UsersRepositoryTypeOrm } from '../../../../users-account/infrastructure/users.repositoryTypeOrm';
import { CommentsRepositoryTypeOrm } from '../../../infrastructure/typeOrm/comments.repositoryTypeOrm';
import { Comment } from '../../../domain/entities/comment.entity';
import { CreateCommentInputDto } from '../../../api/input-dto/dto-comments/create-comment-input.dto';
import { CommentMapper } from '../../mappers/comment.mapper';

export class CreateCommentCommand {
  constructor(
    public body: CreateCommentInputDto,
    public postId: string,
    public userId: string,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand>
{
  constructor(
    @Inject(PostsQueryRepositoryTypeOrm)
    protected postsQueryRepositoryTypeOrm: PostsQueryRepositoryTypeOrm,
    @Inject(UsersRepositoryTypeOrm)
    protected usersRepositoryTypeOrm: UsersRepositoryTypeOrm,
    @Inject(CommentsRepositoryTypeOrm)
    protected commentsRepositoryTypeOrm: CommentsRepositoryTypeOrm,
    @Inject(CommentMapper) protected commentMapper: CommentMapper,
  ) {}
  async execute(command: CreateCommentCommand) {
    const getPost = await this.postsQueryRepositoryTypeOrm.findPostById(
      command.postId,
    );
    const getUser = await this.usersRepositoryTypeOrm.findUserByID(
      command.userId,
    );
    if (!getPost || !getUser)
      throw new NotFoundException(`Blog with ID ${command.postId} not found`);
    const newComment = Comment.createInstanceComment(
      command.body,
      getPost,
      getUser,
    );
    await this.commentsRepositoryTypeOrm.saveComment(newComment);
    return this.commentMapper.toViewAfterCreate(newComment, getUser);
  }
}
