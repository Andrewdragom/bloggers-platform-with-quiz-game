import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';
import { LikeForPost } from '../../domain/entities/likeForPost.entity';

@Injectable()
export class LikeStatusForPostsQueryRepositoryTypeOrm {
  constructor(
    @InjectRepository(LikeForPost)
    protected likeRepository: Repository<LikeForPost>,
  ) {}
  async countLike(postId: string, likeStatus: string) {
    const queryBuilder = this.likeRepository
      .createQueryBuilder('l')
      .where('l.post = :commentId', { postId })
      .andWhere('l.likeStatus = :likeStatus', { likeStatus });

    return await queryBuilder.getCount();
  }
  async getStatus(id: string, userId: string): Promise<LikeForPost | null> {
    if (!isUUID(id) || id === null) {
      throw new NotFoundException('Пост не найден');
    }
    const queryBuilder = this.likeRepository
      .createQueryBuilder('l')
      .where('l.postId = :id', { id })
      .andWhere('l.userId = :userId', { userId });

    return await queryBuilder.getOne();
  }
  async getLast3Likes(id: string) {
    // const result = await this.dataSource.query(
    //   `SELECT * FROM "likesForPosts"
    //     WHERE "postId" = $1
    //     AND ("likeStatus" = $3)
    //     ORDER BY
    //      CASE WHEN $2 = 'asc' THEN "addedAt" END DESC
    //     LIMIT 3;`,
    //   [id, 'asc', 'Like'],
    // );
    // return result;
    if (!isUUID(id) || id === null) {
      throw new NotFoundException('Пост не найден');
    }
    const queryBuilder = this.likeRepository
      .createQueryBuilder('l')
      .leftJoin('l.user', 'user')
      .select([
        'l.createdAt as "addedAt"',
        'user.id as "userId"',
        'user.login as "login"',
      ])
      .where('l.postId = :id', { id })
      .andWhere('l.likeStatus = :status', { status: 'Like' })
      .orderBy('l.createdAt', 'DESC')
      .limit(3);
    return await queryBuilder.getRawMany();
  }
}
