import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from '../domain/entities/player.entity';

@Injectable()
export class PlayerRepositoryTypeOrm {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
  ) {}
  async savePlayer(player: Player) {
    return await this.playerRepository.save(player);
  }
}
