import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CreateBlogDto } from '../api/input-dto/dto-blogs/create-blog.dto';

export type BlogDocument = HydratedDocument<Blog>;

@Schema({ collection: 'blogs' })
export class Blog {
  @Prop()
  id: string;
  @Prop({
    required: true,
  })
  name: string;
  @Prop({
    required: true,
  })
  description: string;
  @Prop({
    required: true,
  })
  websiteUrl: string;
  @Prop()
  createdAt: Date;
  @Prop()
  isMembership: boolean;

  static createInstance(dto: CreateBlogDto): BlogDocument {
    const blog = new Blog();
    blog.id = crypto.randomUUID();
    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    blog.createdAt = new Date();
    blog.isMembership = false;

    return blog as BlogDocument;
  }
}
export const BlogSchema = SchemaFactory.createForClass(Blog);
