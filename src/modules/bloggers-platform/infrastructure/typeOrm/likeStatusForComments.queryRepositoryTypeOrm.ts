import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LikesForComment } from '../../domain/entities/likeForComment.entity';
import { isUUID } from 'class-validator';

@Injectable()
export class LikeStatusForCommentsQueryRepositoryTypeOrm {
  constructor(
    @InjectRepository(LikesForComment)
    protected likeRepository: Repository<LikesForComment>,
  ) {}
  async countLike(commentId: string, likeStatus: string) {
    const queryBuilder = this.likeRepository
      .createQueryBuilder('l')
      .where('l.commentId = :commentId', { commentId })
      .andWhere('l.likeStatus = :likeStatus', { likeStatus });

    return await queryBuilder.getCount();
  }
  async getStatus(id: string, userId: string): Promise<LikesForComment | null> {
    if (!isUUID(id) || id === null) {
      throw new NotFoundException('Пост не найден');
    }
    const queryBuilder = this.likeRepository
      .createQueryBuilder('l')
      .where('l.commentId = :id', { id })
      .andWhere('l.userId = :userId', { userId });

    return await queryBuilder.getOne();
  }
}
