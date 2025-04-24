import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { PostsQueryRepositoryTypeOrm } from '../../../infrastructure/typeOrm/posts.queryRepositoryTypeOrm';
import { LikeStatusForPostsQueryRepositoryTypeOrm } from '../../../infrastructure/typeOrm/likeStatusForPost.queryRepositoryTypeOrm';
import { LikeForPost } from '../../../domain/entities/likeForPost.entity';
import { LikeStatusForPostsRepositoryTypeOrm } from '../../../infrastructure/typeOrm/likeStatusForPost.repository';

export class SendLikeStatusForPostCommand {
  constructor(
    public id: string,
    public userId: string,
    public likeStatus: string,
  ) {}
}

@CommandHandler(SendLikeStatusForPostCommand)
export class SendLikeStatusForPostUseCase
  implements ICommandHandler<SendLikeStatusForPostCommand>
{
  constructor(
    @Inject(PostsQueryRepositoryTypeOrm)
    protected postsQueryRepositoryTypeOrm: PostsQueryRepositoryTypeOrm,
    @Inject(LikeStatusForPostsQueryRepositoryTypeOrm)
    protected likeStatusForPostsQueryRepositoryTypeOrm: LikeStatusForPostsQueryRepositoryTypeOrm,
    @Inject(LikeStatusForPostsRepositoryTypeOrm)
    protected likeStatusForPostsRepositoryTypeOrm: LikeStatusForPostsRepositoryTypeOrm,
  ) {}

  async execute(command: SendLikeStatusForPostCommand) {
    const getPost = await this.postsQueryRepositoryTypeOrm.findPostById(
      command.id,
    );
    if (!getPost) {
      throw new NotFoundException(`Post with ID ${command.id} not found`);
    }

    const haveStatus =
      await this.likeStatusForPostsQueryRepositoryTypeOrm.getStatus(
        command.id,
        command.userId,
      );
    if (!haveStatus) {
      const status = LikeForPost.createInstanceLikeStatus(
        command.id,
        command.userId,
        command.likeStatus,
      );

      return await this.likeStatusForPostsRepositoryTypeOrm.saveStatus(status);
    }
    haveStatus.updateStatus(command.likeStatus);
    await this.likeStatusForPostsRepositoryTypeOrm.saveStatus(haveStatus);
    return haveStatus;
  }
}
