import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../../domain/entities/comment.entity';
import { isUUID } from 'class-validator';

@Injectable()
export class CommentsRepositoryTypeOrm {
  constructor(
    @InjectRepository(Comment)
    protected commentsRepository: Repository<Comment>,
  ) {}
  async saveComment(comment: Comment) {
    return await this.commentsRepository.save(comment);
  }
  async deleteCommentById(id: string | null) {
    if (!isUUID(id) || id === null) {
      throw new NotFoundException('Коммент не найден');
    }

    return await this.commentsRepository.delete({ id });
  }
}
