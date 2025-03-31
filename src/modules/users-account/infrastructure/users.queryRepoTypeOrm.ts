import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../domain/entities/user.entity';
import { Repository } from 'typeorm';
import { UserDto } from '../types/paginated-userResponse.types';

export class UsersQueryRepoTypeOrm {
  constructor(
    @InjectRepository(User) protected userRepository: Repository<User>,
  ) {}
  async findUsers(
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    searchLoginTerm: string | null,
    searchEmailTerm: string | null,
  ): Promise<UserDto[]> {
    const offset = (pageNumber - 1) * pageSize;

    const queryBuilder = this.userRepository.createQueryBuilder('u'); // Используем репозиторий

    // Фильтрация по login и email с использованием OR и игнорированием регистра
    if (searchLoginTerm || searchEmailTerm) {
      const conditions: string[] = [];
      const params: { [key: string]: string } = {};

      if (searchLoginTerm) {
        conditions.push('LOWER(u.login) LIKE LOWER(:login)');
        params.login = `%${searchLoginTerm}%`;
      }

      if (searchEmailTerm) {
        conditions.push('LOWER(u.email) LIKE LOWER(:email)');
        params.email = `%${searchEmailTerm}%`;
      }

      queryBuilder.andWhere(`(${conditions.join(' OR ')})`, params);
    }

    const sortColumn =
      sortBy === 'login' || sortBy === 'email' || sortBy === 'createdAt'
        ? sortBy
        : 'createdAt';
    const sortDir = sortDirection.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    queryBuilder.orderBy(`u.${sortColumn}`, sortDir);

    queryBuilder.limit(pageSize).offset(offset);

    return queryBuilder.getMany();
  }

  async getUsersCount(
    searchLoginTerm: string | null,
    searchEmailTerm: string | null,
  ): Promise<number> {
    const queryBuilder = this.userRepository.createQueryBuilder('u');

    if (searchLoginTerm || searchEmailTerm) {
      const conditions: string[] = [];
      const params: { [key: string]: string } = {};

      if (searchLoginTerm) {
        conditions.push('LOWER(u.login) LIKE LOWER(:login)');
        params.login = `%${searchLoginTerm}%`;
      }

      if (searchEmailTerm) {
        conditions.push('LOWER(u.email) LIKE LOWER(:email)');
        params.email = `%${searchEmailTerm}%`;
      }

      queryBuilder.andWhere(`(${conditions.join(' OR ')})`, params);
    }

    // Получение количества
    const count = await queryBuilder.getCount();
    return count;
  }
}
