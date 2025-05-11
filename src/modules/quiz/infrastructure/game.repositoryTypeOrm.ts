import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from '../domain/entities/game.entity';

@Injectable()
export class GameRepositoryTypeOrm {
  constructor(
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
  ) {}

  async saveGame(game: any) {
    return await this.gameRepository.save(game);
  }
  async addScore(gameId: string, userId: string) {
    console.log(gameId);

    const game = await this.gameRepository.findOneBy({ id: gameId });
    if (!game) throw new NotFoundException('Game not found');

    if (game.firstPlayerId === userId) {
      game.scoreFirstPlayer += 1;
    } else if (game.secondPlayerId === userId) {
      game.scoreSecondPlayer += 1;
    } else {
      throw new ForbiddenException('User is not a participant of the game');
    }

    await this.gameRepository.save(game);
    return game;
  }
  async changeBonusScore(gameId: string) {
    const game = await this.gameRepository.findOneBy({ id: gameId });

    if (!game) throw new NotFoundException('Game not found');

    game.bonusScore = true;

    await this.gameRepository.save(game);
    return game;
  }
  async changeBonusScoreFirst(gameId: string) {
    const game = await this.gameRepository.findOneBy({ id: gameId });

    if (!game) throw new NotFoundException('Game not found');

    game.bonusScoreFirst = true;

    await this.gameRepository.save(game);
    return game;
  }
  async changeBonusScoreSecond(gameId: string) {
    const game = await this.gameRepository.findOneBy({ id: gameId });

    if (!game) throw new NotFoundException('Game not found');

    game.bonusScoreSecond = true;

    await this.gameRepository.save(game);
    return game;
  }
}
