import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../../core/domain/entities/base.entity';
import { User } from '../../../users-account/domain/entities/user.entity';
import { Game } from './game.entity';
import { Question } from './question.entity';

@Entity()
export class Answer extends BaseEntity {
  @Column()
  body: string;
  @Column()
  answerStatus: boolean;
  @Column()
  gameId: string;
  @Column()
  userId: string;
  @Column()
  questionId: string | undefined;

  @ManyToOne(() => Game, (game) => game.answers)
  game: Game;
  @ManyToOne(() => Question, (question) => question.answers)
  question: Question;
  @ManyToOne(() => User, (user) => user.answers)
  user: User;

  static createInstanceAnswer(
    answerBody: string,
    gameId: string,
    userId: string,
    questionId: string | undefined,
    status: boolean,
  ) {
    const answer = new Answer();
    answer.id = crypto.randomUUID();
    answer.body = answerBody;
    answer.gameId = gameId;
    answer.userId = userId;
    answer.questionId = questionId;
    answer.answerStatus = status;

    return answer;
  }
}
