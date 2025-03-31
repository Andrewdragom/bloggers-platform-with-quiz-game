import { Length } from 'class-validator';

export class CreateCommentInputDto {
  @Length(20, 300)
  content: string;
}
