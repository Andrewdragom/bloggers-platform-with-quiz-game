import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GameQuestion } from '../domain/entities/game-question.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GameQuestionQueryRepository {
  constructor(
    @InjectRepository(GameQuestion)
    private readonly gameQuestionRepository: Repository<GameQuestion>,
  ) {}

  async findCurrentQuestion(gameId: string, index: number) {
    return await this.gameQuestionRepository.findOneBy({
      gameId,
      index: index,
    });
  }
}
