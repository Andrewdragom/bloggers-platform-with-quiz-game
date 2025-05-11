import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../../core/domain/entities/base.entity';
import { CreateQuestionDto } from '../../api/input-dto/create-question.dto';
import { UpdateQuestionDto } from '../../api/input-dto/update-question.dto';
import { PublishQuestionDto } from '../../api/input-dto/publish-question.dto';
import { HttpException } from '@nestjs/common';
import { Answer } from './answer.entity';
import { Game } from './game.entity';
import { GameQuestion } from './game-question.entity';

@Entity()
export class Question extends BaseEntity {
  @Column()
  body: string;

  @Column()
  published: boolean;

  @Column({ type: 'simple-array', nullable: true })
  correctAnswers: string[];

  @OneToMany(() => Answer, (answer) => answer.question)
  answers: Answer[];
  @ManyToOne(() => Game, (game) => game.questions, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  game: Game;
  @OneToMany(() => GameQuestion, (gameQuestion) => gameQuestion.question, {
    onDelete: 'SET NULL',
  })
  gameQuestion: GameQuestion[];

  static createInstanceQuestion(dto: CreateQuestionDto) {
    const question = new Question();
    question.id = crypto.randomUUID();
    question.body = dto.body;
    question.createdAt = new Date();
    question.updatedAt = null;
    question.published = false;
    question.correctAnswers = dto.correctAnswers;

    return question;
  }
  updateQuestion(dto: UpdateQuestionDto) {
    if (dto.body) this.body = dto.body.trim();
    if (dto.correctAnswers !== undefined)
      this.correctAnswers = dto.correctAnswers;
    this.updatedAt = new Date();
  }

  publishQuestion(dto: PublishQuestionDto) {
    if (typeof dto.published !== 'boolean') {
      throw new HttpException(
        [{ message: 'Publish should be', field: 'published' }],
        400,
      );
    }
    if (dto.published) this.published = dto.published;
  }
}
