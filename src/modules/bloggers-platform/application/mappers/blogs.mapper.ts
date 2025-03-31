import { Injectable } from '@nestjs/common';
import { BlogsViewDto } from '../../api/view-dto/dto-blogs/blogs-view.dto';
import { Blog } from '../../domain/entities/blog.entity';

@Injectable()
export class BlogsMapper {
  toViewAfterCreate(blog: Blog): BlogsViewDto {
    const dto = new BlogsViewDto();
    dto.id = blog.id;
    dto.name = blog.name;
    dto.description = blog.description;
    dto.websiteUrl = blog.websiteUrl;
    dto.createdAt = blog.createdAt;
    dto.isMembership = blog.isMembership;
    return dto;
  }
  toViewAfterGetAllBlogs(allBlogs: Blog[]): BlogsViewDto[] {
    return allBlogs.map((el) => {
      return {
        id: el.id,
        name: el.name,
        description: el.description,
        websiteUrl: el.websiteUrl,
        createdAt: el.createdAt,
        isMembership: el.isMembership,
      };
    });
  }
}
