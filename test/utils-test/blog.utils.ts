import request from 'supertest';
import { CreateBlogDto } from '../../src/modules/bloggers-platform/api/input-dto/dto-blogs/create-blog.dto';
import { INestApplication } from '@nestjs/common';

export const createBlog = async (
  blog: CreateBlogDto,
  app: INestApplication,
) => {
  const { body } = await request(app.getHttpServer())
    .post('/sa/blogs')
    .auth('admin', 'qwerty')
    .send(blog as CreateBlogDto)
    .expect(201);

  expect(body).toEqual({
    ...blog,
    id: expect.any(String),
    createdAt: expect.any(String),
    isMembership: expect.any(Boolean),
  });
  return body;
};
