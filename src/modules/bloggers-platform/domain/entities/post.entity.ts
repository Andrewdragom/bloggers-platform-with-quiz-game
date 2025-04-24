import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { BaseEntity } from '../../../../core/domain/entities/base.entity';
import { Blog } from './blog.entity';
import { CreatePostDto } from '../../api/input-dto/dto-posts/create-post.dto';
import { CreatePostByBlogInputDto } from '../../api/input-dto/dto-blogs/create-post-by-blog-input-dto';
import { UpdatePostDto } from '../../api/input-dto/dto-posts/update-post.dto';
import { Comment } from './comment.entity';
import { LikeForPost } from './likeForPost.entity';

@Entity()
export class Post extends BaseEntity {
  @PrimaryColumn('uuid')
  id: string;
  @Column()
  title: string;
  @Column()
  shortDescription: string;
  @Column()
  content: string;

  @ManyToOne(() => Blog, (blog) => blog.posts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'blogId' })
  blog: Blog;
  @Column()
  blogId: string;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => LikeForPost, (likeForPost) => likeForPost.post)
  likes: LikeForPost[];

  static createInstancePost(
    dto: CreatePostDto | CreatePostByBlogInputDto,
    blog: Blog,
  ): Post {
    const post = new Post();
    post.id = crypto.randomUUID();
    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.createdAt = new Date();
    post.blog = blog;

    return post;
  }

  updatePost(dto: UpdatePostDto, getBlog: Blog) {
    this.blog = getBlog;
    if (dto.title) this.title = dto.title;
    if (dto.shortDescription) this.shortDescription = dto.shortDescription;
    if (dto.content) this.content = dto.content;
    this.updatedAt = new Date();
  }
}
