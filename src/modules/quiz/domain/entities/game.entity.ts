import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../../core/domain/entities/base.entity';
import { User } from '../../../users-account/domain/entities/user.entity';
import { Answer } from './answer.entity';
import { Question } from './question.entity';
import { GameQuestion } from './game-question.entity';

@Entity()
export class Game extends BaseEntity {
  @Column()
  firstPlayerId: string;
  @Column({ nullable: true })
  secondPlayerId: string | null;
  @Column()
  scoreFirstPlayer: number;
  @Column({ nullable: true })
  scoreSecondPlayer: number;
  @Column()
  pending: string;
  @Column({ nullable: true })
  pairCreatedDate: Date;
  @Column({ nullable: true })
  finishGameDate: Date;
  @Column({ nullable: true })
  startGameDate: Date;
  @Column({ nullable: true })
  bonusScore: boolean = false;
  @Column({ nullable: true })
  bonusScoreFirst: boolean = false;
  @Column({ nullable: true })
  bonusScoreSecond: boolean = false;

  @ManyToOne(() => User, (user) => user.sessions)
  firstPlayer: User;
  @ManyToOne(() => User, (user) => user.sessions)
  secondPlayer: User;
  @OneToMany(() => Answer, (answer) => answer.game, {
    onDelete: 'SET NULL',
  })
  answers: Answer[] | null;
  @OneToMany(() => Question, (question) => question.game, {
    onDelete: 'SET NULL',
  })
  questions: Question[] | null;
  @OneToMany(() => GameQuestion, (gameQuestion) => gameQuestion.game)
  gameQuestion: GameQuestion[];

  static createGameForFirstPlayer(firstPlayer: any) {
    const game = new Game();
    game.id = crypto.randomUUID();
    game.firstPlayerId = firstPlayer;
    game.secondPlayerId = null;
    game.answers = null;
    game.createdAt = new Date();
    game.scoreFirstPlayer = 0;
    game.pending = 'PendingSecondPlayer';
    game.pairCreatedDate = new Date();
    return game;
  }

  joinSecondPlayer(secondPlayer: any, question: any) {
    const date = new Date();

    this.secondPlayerId = secondPlayer;
    this.scoreSecondPlayer = 0;
    this.pending = 'Active';
    this.questions = question;
    this.startGameDate = date;
  }
}
