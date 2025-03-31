import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../../core/domain/entities/base.entity';
import { Post } from './post.entity';
import { CreateBlogDto } from '../../api/input-dto/dto-blogs/create-blog.dto';
import { UpdateBlogDto } from '../../api/input-dto/dto-blogs/update-blog.dto';

@Entity()
export class Blog extends BaseEntity {
  @Column()
  name: string;
  @Column()
  description: string;
  @Column()
  websiteUrl: string;
  @Column()
  isMembership: boolean;

  @OneToMany(() => Post, (post) => post.blog)
  posts: Post[];
  static createInstanceBlog(dto: CreateBlogDto): Blog {
    const blog = new Blog();
    blog.id = crypto.randomUUID();
    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    blog.createdAt = new Date();
    blog.isMembership = false;
    return blog;
  }

  updateBlog(dto: UpdateBlogDto) {
    if (dto.name) this.name = dto.name.trim();
    if (dto.description !== undefined)
      this.description = dto.description.trim();
    if (dto.websiteUrl) this.websiteUrl = dto.websiteUrl;
    this.updatedAt = new Date();
  }
}
