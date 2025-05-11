import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameQuestion } from '../domain/entities/game-question.entity';

@Injectable()
export class GameQuestionRepositoryTypeOrm {
  constructor(
    @InjectRepository(GameQuestion)
    private readonly gameQuestionRepository: Repository<GameQuestion>,
  ) {}

  async saveGameQuestion(game: any) {
    return await this.gameQuestionRepository.save(game);
  }
}
