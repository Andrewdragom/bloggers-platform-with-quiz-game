import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { BlogsRepositoryTypeOrm } from '../../../infrastructure/typeOrm/blogs.repositoryTypeOrm';

export class DeleteBlogCommand {
  constructor(public id: string | null) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(
    @Inject(BlogsRepositoryTypeOrm)
    protected blogsRepositoryTypeOrm: BlogsRepositoryTypeOrm,
  ) {}
  async execute(command: DeleteBlogCommand): Promise<boolean> {
    const result = await this.blogsRepositoryTypeOrm.deleteBlogById(command.id);
    if (!result.affected) {
      throw new NotFoundException(`Blog with ID ${command.id} not found`);
    }
    return true;
  }
}
