import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from '../domain/entities/game.entity';
import { isUUID } from 'class-validator';

@Injectable()
export class GameQueryRepositoryTypeOrm {
  constructor(
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
  ) {}

  async findFreeGame(): Promise<Game | null> {
    return await this.gameRepository.findOneBy({
      pending: 'PendingSecondPlayer',
    });
  }
  async findActiveCurrentGame(userId: string) {
    return await this.gameRepository.findOne({
      where: [
        { pending: 'Active', firstPlayerId: userId },
        { pending: 'Active', secondPlayerId: userId },
      ],
    });
  }
  async findCurrentGame(userId: string) {
    return await this.gameRepository.findOne({
      where: [
        { pending: 'Active', firstPlayerId: userId },
        { pending: 'Active', secondPlayerId: userId },
        { pending: 'PendingSecondPlayer', firstPlayerId: userId },
        { pending: 'PendingSecondPlayer', secondPlayerId: userId },
      ],
    });
  }
  async findGameByGameId(gameId: string) {
    if (!isUUID(gameId) || gameId === null) {
      throw new NotFoundException('Пост не найден');
    }
    return await this.gameRepository.findOneBy({ id: gameId });
  }
  async findCurrentGameForFindAboutGameId(userId: string, gameId: string) {
    return await this.gameRepository.findOne({
      where: [
        { id: gameId, pending: 'Active', firstPlayerId: userId },
        { id: gameId, pending: 'Active', secondPlayerId: userId },
        { id: gameId, pending: 'PendingSecondPlayer', firstPlayerId: userId },
        { id: gameId, pending: 'PendingSecondPlayer', secondPlayerId: userId },
        { id: gameId, pending: 'Finished', firstPlayerId: userId },
        { id: gameId, pending: 'Finished', secondPlayerId: userId },
      ],
    });
  }
}
