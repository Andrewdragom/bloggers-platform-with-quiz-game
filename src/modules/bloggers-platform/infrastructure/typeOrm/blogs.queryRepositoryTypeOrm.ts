import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from '../../domain/entities/blog.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { isUUID } from 'class-validator';

@Injectable()
export class BlogsQueryRepositoryTypeOrm {
  constructor(
    @InjectRepository(Blog) protected blogsRepository: Repository<Blog>,
  ) {}
  async findBlogs(
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    searchNameTerm: string | null,
  ) {
    // console.log(pageNumber, pageSize, sortBy, sortDirection);
    const offset = ((pageNumber - 1) * pageSize) as number;

    const queryBuilder = this.blogsRepository.createQueryBuilder('b');

    if (searchNameTerm) {
      queryBuilder.andWhere('LOWER(b.name) LIKE LOWER(:name)', {
        name: `%${searchNameTerm}%`,
      });
    }

    const sortColumn =
      sortBy === 'name' || sortBy === 'websiteUrl' || sortBy === 'createdAt'
        ? sortBy
        : 'createdAt';
    const sortDir = sortDirection?.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    queryBuilder.orderBy(`b.${sortColumn}`, sortDir);
    queryBuilder.limit(pageSize).offset(Number(offset));

    return queryBuilder.getMany();
  }
  async getBlogsCount(searchNameTerm: string | null): Promise<number> {
    const queryBuilder = this.blogsRepository.createQueryBuilder('b');

    if (searchNameTerm) {
      queryBuilder.andWhere('LOWER(b.name) LIKE LOWER(:name)', {
        name: `%${searchNameTerm}%`,
      });
    }
    return await queryBuilder.getCount();
  }
  async findBlogById(id: string | null | undefined) {
    if (!isUUID(id) || id === null) {
      throw new NotFoundException('Блог не найден');
    }
    return await this.blogsRepository.findOneBy({ id });
  }
}
