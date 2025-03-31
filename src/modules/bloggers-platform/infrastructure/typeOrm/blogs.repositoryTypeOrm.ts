import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from '../../domain/entities/blog.entity';
import { Repository } from 'typeorm';
import { CreateBlogDto } from '../../api/input-dto/dto-blogs/create-blog.dto';
import { isUUID } from 'class-validator';

@Injectable()
export class BlogsRepositoryTypeOrm {
  constructor(
    @InjectRepository(Blog) protected blogRepository: Repository<Blog>,
  ) {}
  async createNewBlog(newBlog: CreateBlogDto) {
    return await this.blogRepository.save(newBlog);
  }
  async deleteBlogById(id: string | null) {
    if (!isUUID(id) || id === null) {
      throw new NotFoundException('Блог не найден');
    }

    return await this.blogRepository.delete({ id });
  }
  async updateBlogById(blog: Blog): Promise<void> {
    await this.blogRepository.save(blog);
  }
}
