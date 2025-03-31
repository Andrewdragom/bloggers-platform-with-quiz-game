import { Length, Matches, Validate } from 'class-validator';
import { IsBlogIdExistConstraint } from '../dto-blogs/customValidators/IsBlogIdExist-custom-validator';

export class CreatePostDto {
  @Length(1, 30)
  @Matches(/^(?!\s+$).*/, { message: 'Name cannot contain only spaces' })
  title: string;
  @Length(1, 100)
  @Matches(/^(?!\s+$).*/, { message: 'Name cannot contain only spaces' })
  shortDescription: string;
  @Length(1, 1000)
  @Matches(/^(?!\s+$).*/, { message: 'Name cannot contain only spaces' })
  content: string;
  @Validate(IsBlogIdExistConstraint)
  blogId: string;
}
