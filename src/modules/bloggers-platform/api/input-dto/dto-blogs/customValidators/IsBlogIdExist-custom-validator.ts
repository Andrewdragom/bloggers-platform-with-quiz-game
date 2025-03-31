import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { BlogsService } from '../../../../application/blogs.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsBlogIdExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly blogService: BlogsService) {} // ✅ Внедряем BlogsService

  async validate(blogId: string): Promise<boolean> {
    if (!blogId) return false;
    const blog = await this.blogService.findBlogByIdForValid(blogId);
    return !!blog;
  }

  defaultMessage(): string {
    return 'Blog with the given ID does not exist';
  }
}
