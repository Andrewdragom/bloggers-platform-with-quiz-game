import { CreateBlogDto } from '../../../api/input-dto/dto-blogs/create-blog.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { BlogsRepositoryTypeOrm } from '../../../infrastructure/typeOrm/blogs.repositoryTypeOrm';
import { BlogsViewDto } from '../../../api/view-dto/dto-blogs/blogs-view.dto';
import { Blog } from '../../../domain/entities/blog.entity';
import { BlogsMapper } from '../../mappers/blogs.mapper';

export class CreateBlogCommand {
  constructor(public body: CreateBlogDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(
    @Inject(BlogsRepositoryTypeOrm)
    protected blogsRepositoryTypeOrm: BlogsRepositoryTypeOrm,
    @Inject(BlogsMapper) protected blogsMapper: BlogsMapper,
  ) {}
  async execute(command: CreateBlogCommand): Promise<BlogsViewDto> {
    const newBlog = Blog.createInstanceBlog(command.body);
    await this.blogsRepositoryTypeOrm.createNewBlog(newBlog);
    return this.blogsMapper.toViewAfterCreate(newBlog);
  }
}
