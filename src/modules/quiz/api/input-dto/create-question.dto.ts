import { Length } from 'class-validator';

export class CreateQuestionDto {
  @Length(10, 500)
  body: string;
  correctAnswers: string[];
}
