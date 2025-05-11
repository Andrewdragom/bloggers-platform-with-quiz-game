import { BaseEntity } from '../../../../core/domain/entities/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Game } from './game.entity';
import { Question } from './question.entity';

@Entity()
export class GameQuestion extends BaseEntity {
  @Column({ nullable: true })
  questionId: string;
  @Column({ nullable: true })
  gameId: string;
  @Column()
  index: number;

  @ManyToOne(() => Game, (game) => game.gameQuestion, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  game: Game;
  @ManyToOne(() => Question, (question) => question.gameQuestion, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  question: Question;

  static createGameAndJoinQuestion(
    question: any,
    gameId: string,
    index: number,
  ) {
    const game = new GameQuestion();
    game.id = crypto.randomUUID();
    game.gameId = gameId;
    game.questionId = question.id;
    game.index = index;
    return game;
  }
}
