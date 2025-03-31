import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from '../../domain/entities/post.entity';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';

@Injectable()
export class PostsQueryRepositoryTypeOrm {
  constructor(
    @InjectRepository(Post) protected postsRepository: Repository<Post>,
  ) {}
  async findPostsByBlogId(
    id: string | null | undefined,
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
  ): Promise<Post[]> {
    const offset = (pageNumber - 1) * pageSize;

    const queryBuilder = this.postsRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.blog', 'blog') // Подгружаем связь с блогом
      .where('blog.id = :id', { id }); // Условие по blogId
    // Добавляем сортировку
    const validSortFields = [
      'id',
      'title',
      'shortDescription',
      'content',
      'createdAt',
      'updatedAt',
      'blogName',
    ];
    const direction = sortDirection.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    if (!validSortFields.includes(sortBy)) {
      sortBy = 'createdAt'; // По умолчанию сортируем по createdAt
    }

    if (sortBy === 'blogName') {
      queryBuilder.orderBy('blog.name', direction); // Сортируем по имени блога
    } else {
      queryBuilder.orderBy(`p.${sortBy}`, direction); // Сортируем по полю поста
    }

    // Добавляем пагинацию
    queryBuilder.skip(offset).take(pageSize);
    return queryBuilder.getMany();
  }
  async getPostsCountForBlog(id: string | null | undefined): Promise<number> {
    const queryBuilder = this.postsRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.blog', 'blog')
      .where('blog.id = :id', { id });

    return await queryBuilder.getCount();
  }
  async findPostById(id: string | null | undefined) {
    if (!isUUID(id) || id === null) {
      throw new NotFoundException('Пост не найден');
    }
    const queryBuilder = this.postsRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.blog', 'blog')
      .where('p.id = :id', { id });
    return queryBuilder.getOne();
  }
  async findPosts(
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
  ): Promise<Post[]> {
    const offset = (pageNumber - 1) * pageSize;

    const queryBuilder = this.postsRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.blog', 'blog'); // Подгружаем связь с блогом
    // Добавляем сортировку
    const validSortFields = [
      'id',
      'title',
      'shortDescription',
      'content',
      'createdAt',
      'updatedAt',
      'blogName',
    ];
    const direction = sortDirection.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    if (!validSortFields.includes(sortBy)) {
      sortBy = 'createdAt'; // По умолчанию сортируем по createdAt
    }

    if (sortBy === 'blogName') {
      queryBuilder.orderBy('blog.name', direction); // Сортируем по имени блога
    } else {
      queryBuilder.orderBy(`p.${sortBy}`, direction); // Сортируем по полю поста
    }

    // Добавляем пагинацию
    queryBuilder.skip(offset).take(pageSize);
    return queryBuilder.getMany();
  }
  async getPostsCount(): Promise<number> {
    const queryBuilder = this.postsRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.blog', 'blog');

    return await queryBuilder.getCount();
  }
}
