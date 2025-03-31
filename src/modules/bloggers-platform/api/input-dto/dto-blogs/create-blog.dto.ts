import { Length, Matches } from 'class-validator';

export class CreateBlogDto {
  @Length(1, 15)
  @Matches(/^(?!\s+$).*/, { message: 'Name cannot contain only spaces' })
  name: string;
  @Length(1, 500)
  description: string;
  @Length(1, 100)
  @Matches(
    /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]*)*\/?$/,
    {
      message: 'Website URL format is invalid',
    },
  )
  websiteUrl: string;
}
