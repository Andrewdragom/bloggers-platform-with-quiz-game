import { BaseEntity } from '../../../../core/domain/entities/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from '../../../users-account/domain/entities/user.entity';

@Entity()
export class Player extends BaseEntity {
  @Column()
  winsCount: number = 0;
  @Column()
  lossesCount: number = 0;
  @Column()
  drawsCount: number = 0;
  @Column()
  sumScore: number = 0;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.player)
  user: User;

  static createPlayer(userId: string) {
    const player = new Player();
    player.id = crypto.randomUUID();
    player.userId = userId;
    return player;
  }
}
