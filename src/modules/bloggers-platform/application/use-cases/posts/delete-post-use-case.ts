import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { BlogsQueryRepositoryTypeOrm } from '../../../infrastructure/typeOrm/blogs.queryRepositoryTypeOrm';
import { PostRepositoryTypeOrm } from '../../../infrastructure/typeOrm/posts.repositoryTypeOrm';

export class DeletePostCommand {
  constructor(
    public postId: string | null,
    public blogId: string | null,
  ) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(
    @Inject(BlogsQueryRepositoryTypeOrm)
    protected blogsQueryRepositoryTypeOrm: BlogsQueryRepositoryTypeOrm,
    @Inject(PostRepositoryTypeOrm)
    protected postRepositoryTypeOrm: PostRepositoryTypeOrm,
  ) {}
  async execute(command: DeletePostCommand): Promise<boolean> {
    const getBlog = await this.blogsQueryRepositoryTypeOrm.findBlogById(
      command.blogId,
    );
    if (!getBlog)
      throw new NotFoundException(`Blog with ID ${command.blogId} not found`);

    const result = await this.postRepositoryTypeOrm.deletePostById(
      command.postId,
    );
    if (!result.affected) {
      throw new NotFoundException(`Blog with ID ${command.postId} not found`);
    }
    return true;
  }
}
