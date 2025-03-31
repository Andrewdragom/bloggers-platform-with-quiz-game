import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from '../../../api/input-dto/dto-posts/create-post.dto';
import { CreatePostByBlogInputDto } from '../../../api/input-dto/dto-blogs/create-post-by-blog-input-dto';
import { PostsViewDto } from '../../../api/view-dto/dto-posts/posts-view.dto';
import { BlogsQueryRepositoryTypeOrm } from '../../../infrastructure/typeOrm/blogs.queryRepositoryTypeOrm';
import { Post } from '../../../domain/entities/post.entity';
import { PostRepositoryTypeOrm } from '../../../infrastructure/typeOrm/posts.repositoryTypeOrm';
import { PostsMapper } from '../../mappers/posts.mapper';

export class CreatePostCommand {
  constructor(
    public body: CreatePostDto | CreatePostByBlogInputDto,
    public blogId: string,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    @Inject(BlogsQueryRepositoryTypeOrm)
    protected blogsQueryRepositoryTypeOrm: BlogsQueryRepositoryTypeOrm,
    @Inject(PostRepositoryTypeOrm)
    protected postRepositoryTypeOrm: PostRepositoryTypeOrm,
    @Inject(PostsMapper) protected postsMapper: PostsMapper,
  ) {}
  async execute(command: CreatePostCommand): Promise<PostsViewDto> {
    const getBlog = await this.blogsQueryRepositoryTypeOrm.findBlogById(
      command.blogId,
    );
    if (!getBlog)
      throw new NotFoundException(`Blog with ID ${command.blogId} not found`);
    const newPost = Post.createInstancePost(command.body, getBlog);
    await this.postRepositoryTypeOrm.savePost(newPost);
    return this.postsMapper.toViewAfterCreate(newPost);
  }
}
