import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../../domain/entities/post.entity';
import { isUUID } from 'class-validator';
import { NotFoundException } from '@nestjs/common';

export class PostRepositoryTypeOrm {
  constructor(
    @InjectRepository(Post) protected postRepository: Repository<Post>,
  ) {}
  async savePost(post: any) {
    return await this.postRepository.save(post);
  }
  async deletePostById(id: string | null | undefined) {
    if (!isUUID(id) || id === null) {
      throw new NotFoundException('Блог не найден');
    }

    return await this.postRepository.delete({ id });
  }
}
