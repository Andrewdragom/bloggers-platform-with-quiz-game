import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from '../domain/entities/question.entity';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';

@Injectable()
export class QuestionsQueryRepositoryTypeOrm {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
  ) {}
  async findQuestions(
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    bodySearchTerm: string | null,
    publishedStatus: string,
  ) {
    const offset = ((pageNumber - 1) * pageSize) as number;

    const queryBuilder = this.questionRepository
      .createQueryBuilder('q')
      .select([
        'q.id as "id"',
        'q.body as "body"',
        'q."correctAnswers" as "correctAnswer"',
        'q.published as "published"',
        'q.createdAt as "createdAt"',
        'q.updatedAt as "updatedAt"',
      ]);

    if (bodySearchTerm) {
      queryBuilder.andWhere('LOWER(q.body) LIKE LOWER(:body)', {
        body: `%${bodySearchTerm}%`,
      });
    }
    if (publishedStatus === 'published') {
      queryBuilder.andWhere('q.published = :published', { published: true });
    } else if (publishedStatus === 'notPublished') {
      queryBuilder.andWhere('q.published = :published', { published: false });
    }

    const sortColumn =
      sortBy === 'body' || sortBy === 'updatedAt' || sortBy === 'createdAt'
        ? sortBy
        : 'createdAt';
    const sortDir = sortDirection?.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    queryBuilder.orderBy(`q.${sortColumn}`, sortDir);
    queryBuilder.limit(pageSize).offset(Number(offset));

    return queryBuilder.getRawMany();
  }
  async getQuestionsCount(
    bodySearchTerm: string | null,
    publishedStatus: string,
  ): Promise<number> {
    const queryBuilder = this.questionRepository.createQueryBuilder('q');
    if (bodySearchTerm) {
      queryBuilder.andWhere('LOWER(q.body) LIKE LOWER(:body)', {
        body: `%${bodySearchTerm}%`,
      });
    }
    if (publishedStatus === 'published') {
      queryBuilder.andWhere('q.published = :published', { published: true });
    } else if (publishedStatus === 'notPublished') {
      queryBuilder.andWhere('q.published = :published', { published: false });
    }
    return await queryBuilder.getCount();
  }
  async findQuestionById(id: string | null | undefined) {
    if (!isUUID(id) || id === null) {
      throw new NotFoundException('Вопрос не найден');
    }
    return await this.questionRepository.findOneBy({ id });
  }
  async getFiveRandomQuestions() {
    return this.questionRepository
      .createQueryBuilder('q')
      .select([
        'q.id as "id"',
        'q.body as "body"',
        'q.correctAnswers as "correctAnswer"',
        'q.published as "published"',
        'q.createdAt as "createdAt"',
      ])
      .orderBy('RANDOM()')
      .where('q.published = :published', { published: true })
      .limit(5)
      .getRawMany();
  }
  async getQuestionByGameId(gameId: string) {
    const questions = await this.questionRepository
      .createQueryBuilder('q')
      .leftJoin('q.gameQuestion', 'gameQuestion')
      .select([
        'q.id as "id"',
        'q.body as "body"',
        'gameQuestion.index as "index"',
      ])
      .where('gameQuestion.gameId = :gameId', { gameId })
      .orderBy('gameQuestion.index', 'ASC')
      .getRawMany();
    return questions.map((question) => {
      return {
        id: question.id,
        body: question.body,
      };
    });
  }
}
