import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { BlogsQueryRepositoryTypeOrm } from '../../../infrastructure/typeOrm/blogs.queryRepositoryTypeOrm';
import { PostsViewDto } from '../../../api/view-dto/dto-posts/posts-view.dto';
import { PostRepositoryTypeOrm } from '../../../infrastructure/typeOrm/posts.repositoryTypeOrm';
import { PostsQueryRepositoryTypeOrm } from '../../../infrastructure/typeOrm/posts.queryRepositoryTypeOrm';
import { UpdatePostDto } from '../../../api/input-dto/dto-posts/update-post.dto';
import { PostsMapper } from '../../mappers/posts.mapper';

export class UpdatePostCommand {
  constructor(
    public postId: string | null | undefined,
    public body: UpdatePostDto,
    public blogId: string,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    @Inject(BlogsQueryRepositoryTypeOrm)
    protected blogsQueryRepositoryTypeOrm: BlogsQueryRepositoryTypeOrm,
    @Inject(PostRepositoryTypeOrm)
    protected postRepositoryTypeOrm: PostRepositoryTypeOrm,
    @Inject(PostsQueryRepositoryTypeOrm)
    protected postsQueryRepositoryTypeOrm: PostsQueryRepositoryTypeOrm,
    @Inject(PostsMapper) protected postsMapper: PostsMapper,
  ) {}
  async execute(command: UpdatePostCommand): Promise<PostsViewDto> {
    const getBlog = await this.blogsQueryRepositoryTypeOrm.findBlogById(
      command.blogId,
    );
    if (!getBlog)
      throw new NotFoundException(`Blog with ID ${command.blogId} not found`);
    const getPost = await this.postsQueryRepositoryTypeOrm.findPostById(
      command.postId,
    );
    if (!getPost)
      throw new NotFoundException(`Post with ID ${command.postId} not found`);
    getPost.updatePost(command.body, getBlog);
    await this.postRepositoryTypeOrm.savePost(getPost);
    return this.postsMapper.toViewAfterCreate(getPost);
  }
}
