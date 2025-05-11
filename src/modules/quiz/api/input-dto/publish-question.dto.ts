import { IsNotEmpty } from 'class-validator';

export class PublishQuestionDto {
  @IsNotEmpty()
  published: boolean;
}
