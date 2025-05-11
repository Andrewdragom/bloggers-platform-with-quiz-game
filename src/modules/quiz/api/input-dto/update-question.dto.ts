import { Length } from 'class-validator';

export class UpdateQuestionDto {
  @Length(10, 500)
  body: string;
  correctAnswers: string[];
}
