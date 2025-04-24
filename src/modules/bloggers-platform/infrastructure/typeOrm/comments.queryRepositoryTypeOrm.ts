import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from '../../domain/entities/comment.entity';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';

@Injectable()
export class CommentsQueryRepositoryTypeOrm {
  constructor(
    @InjectRepository(Comment)
    protected commentsRepository: Repository<Comment>,
  ) {}
  async findCommentById(id: string | null | undefined) {
    if (!isUUID(id) || id === null) {
      throw new NotFoundException('Коммент не найден');
    }
    const queryBuilder = this.commentsRepository
      .createQueryBuilder('c')
      .leftJoin('c.user', 'user')
      .select([
        'c.id as "id"',
        'c.content as "content"',
        'user.id as "userId"',
        'user.login as "userLogin"',
        'c.createdAt as "createdAt"',
      ])
      .where('c.id = :id', { id });
    return queryBuilder.getRawOne();
  }
  async findCommentByIdForUpdate(
    id: string | null | undefined,
  ): Promise<Comment | null> {
    if (!isUUID(id) || id === null) {
      throw new NotFoundException('Коммент не найден');
    }
    const queryBuilder = this.commentsRepository
      .createQueryBuilder('c')
      .leftJoin('c.user', 'user')
      .where('c.id = :id', { id });
    return queryBuilder.getOne();
  }
  async findCommentByPostId(
    id: string,
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
  ) {
    const offset = (pageNumber - 1) * pageSize;

    const queryBuilder = this.commentsRepository
      .createQueryBuilder('c')
      .leftJoin('c.user', 'user')
      .leftJoin('c.likes', 'likes')
      .leftJoin('c.post', 'post')
      .select([
        'c.id as "id"',
        'c.content as "content"',
        'user.id as "userId"',
        'user.login as "userLogin"',
        'c.createdAt as "createdAt"',
      ])
      .addSelect(
        // Считаем количество лайков (likeStatus = 'LIKE')
        `COUNT(CASE WHEN likes.likeStatus = 'Like' THEN 1 END)`,
        'likesCount',
      )
      .addSelect(
        // Считаем количество дизлайков (likeStatus = 'DISLIKE')
        `COUNT(CASE WHEN likes.likeStatus = 'Dislike' THEN 1 END)`,
        'dislikesCount',
      )
      .groupBy('c.id, user.id')
      .where('post.id = :id', { id });

    // Добавляем сортировку
    const validSortFields = ['id', 'content', 'createdAt', 'updatedAt'];
    const direction = sortDirection.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    if (!validSortFields.includes(sortBy)) {
      sortBy = 'createdAt'; // По умолчанию сортируем по createdAt
    }
    queryBuilder.orderBy(`c.${sortBy}`, direction);
    queryBuilder.limit(pageSize).offset(offset);

    return queryBuilder.getRawMany();
  }
  async getCommentsCountForPost(id: string | null | undefined) {
    const queryBuilder = this.commentsRepository
      .createQueryBuilder('c')
      .leftJoin('c.post', 'post')
      .where('post.id = :id', { id });
    return await queryBuilder.getCount();
  }
}
