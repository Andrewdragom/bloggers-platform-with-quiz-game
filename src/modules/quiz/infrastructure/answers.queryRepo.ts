import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Answer } from '../domain/entities/answer.entity';

@Injectable()
export class AnswersQueryRepo {
  constructor(
    @InjectRepository(Answer)
    private readonly answersRepository: Repository<Answer>,
  ) {}

  async findAnswerByGameIdAndUserId(gameId: string, userId: string) {
    return await this.answersRepository.findBy({ gameId, userId });
  }
  async findAnswersForFinishGame(gameId: string) {
    return await this.answersRepository.findBy({ gameId });
  }
  async findAnswerForCurrentGame(gameId: string, userId: string) {
    const answers = await this.answersRepository
      .createQueryBuilder('a')
      // .leftJoin('q.gameQuestion', 'gameQuestion')
      .select([
        'a.questionId as "questionId"',
        'a.answerStatus as "status"',
        'a.createdAt as "addedAt"',
      ])
      .where('a.gameId = :gameId AND a.userId = :userId', { gameId, userId })
      .orderBy('a.createdAt', 'ASC')
      .getRawMany();
    return answers.map((element) => {
      return {
        questionId: element.questionId,
        answerStatus: element.status === true ? 'Correct' : 'Incorrect',
        addedAt: element.addedAt,
      };
    });
  }
}
