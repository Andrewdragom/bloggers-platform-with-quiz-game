import { Length } from 'class-validator';

export class CreateBlogDto {
  @Length(1, 30)
  name: string;
  description: string;
  websiteUrl: string;
}
