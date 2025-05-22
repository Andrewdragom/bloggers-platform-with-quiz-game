import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from '../domain/entities/player.entity';
import { GetTopUsersQueryParamsDto } from '../api/input-dto/get-top-users-query-params.dto';

@Injectable()
export class PlayerQueryRepositoryTypeOrm {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
  ) {}

  async findPlayer(userId: string): Promise<Player | null> {
    return await this.playerRepository.findOneBy({
      userId: userId,
    });
  }
  async findPlayersForTop(query: GetTopUsersQueryParamsDto) {
    const offset = (query.pageNumber - 1) * query.pageSize;
    const sortFields = query.sort ?? []; // может быть строкой или массивом
    const sortArray = Array.isArray(sortFields) ? sortFields : [sortFields];

    const queryBuilder = this.playerRepository.createQueryBuilder('p').select([
      'p.sumScore as "sumScore"',
      `(CASE 
    WHEN (p.winsCount + p.lossesCount + p.drawsCount) = 0 THEN 0 
    ELSE ROUND(CAST(p.sumScore AS numeric) / NULLIF((p.winsCount + p.lossesCount + p.drawsCount), 0), 2) 
  END) as "avgScores"`,
      'p.winsCount as "winsCount"',
      'p.lossesCount as "lossesCount"',
      'p.drawsCount as "drawsCount"',
      'p.userId as "userId"',
    ]);

    // Применяем сортировку
    sortArray.forEach((sortRule, index) => {
      const [field, directionRaw] = sortRule.trim().split(/\s+/);
      const direction = directionRaw?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      // Поддерживаем только те поля, которые есть в SELECT
      const allowedFields = [
        'avgScores',
        'sumScore',
        'winsCount',
        'lossesCount',
      ];

      if (allowedFields.includes(field)) {
        const sortField = `"${field}"`;
        if (index === 0) {
          queryBuilder.orderBy(sortField, direction);
        } else {
          queryBuilder.addOrderBy(sortField, direction);
        }
      }
    });
    queryBuilder.limit(query.pageSize).offset(Number(offset));

    return queryBuilder.getRawMany();
  }
  async getPlayerCount(): Promise<number> {
    const queryBuilder = this.playerRepository.createQueryBuilder('p');

    return await queryBuilder.getCount();
  }
}
