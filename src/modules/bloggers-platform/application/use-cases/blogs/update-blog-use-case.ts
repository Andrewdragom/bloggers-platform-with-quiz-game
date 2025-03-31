import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { BlogsRepositoryTypeOrm } from '../../../infrastructure/typeOrm/blogs.repositoryTypeOrm';
import { BlogsMapper } from '../../mappers/blogs.mapper';
import { BlogsQueryRepositoryTypeOrm } from '../../../infrastructure/typeOrm/blogs.queryRepositoryTypeOrm';
import { UpdateBlogDto } from '../../../api/input-dto/dto-blogs/update-blog.dto';
import { BlogsViewDto } from '../../../api/view-dto/dto-blogs/blogs-view.dto';

export class UpdateBlogCommand {
  constructor(
    public body: UpdateBlogDto,
    public id: string,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(
    @Inject(BlogsRepositoryTypeOrm)
    protected blogsRepositoryTypeOrm: BlogsRepositoryTypeOrm,
    @Inject(BlogsMapper) protected blogsMapper: BlogsMapper,
    @Inject(BlogsQueryRepositoryTypeOrm)
    protected blogsQueryRepositoryTypeOrm: BlogsQueryRepositoryTypeOrm,
  ) {}
  async execute(command: UpdateBlogCommand): Promise<BlogsViewDto> {
    const getBlog = await this.blogsQueryRepositoryTypeOrm.findBlogById(
      command.id,
    );
    if (!getBlog) {
      throw new NotFoundException(`Blog with ID ${command.id} not found`);
    }
    getBlog.updateBlog(command.body);
    await this.blogsRepositoryTypeOrm.updateBlogById(getBlog);
    return this.blogsMapper.toViewAfterCreate(getBlog);
  }
}
