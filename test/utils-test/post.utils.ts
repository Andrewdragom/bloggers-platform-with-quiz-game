import request from 'supertest';
import { CreatePostDto } from '../../src/modules/bloggers-platform/api/input-dto/dto-posts/create-post.dto';
import { INestApplication } from '@nestjs/common';

export const createPost = async (
  post: any,
  blog: any,
  app: INestApplication,
) => {
  const { body } = await request(app.getHttpServer())
    .post(`/sa/blogs/${blog.id}/posts`)
    .auth('admin', 'qwerty')
    .send(post as CreatePostDto)
    .expect(201);
  expect(body).toEqual({
    ...post,
    id: expect.any(String),
    blogId: blog.id,
    blogName: blog.name,
    createdAt: expect.any(String),
    extendedLikesInfo: {
      likesCount: expect.any(Number),
      dislikesCount: expect.any(Number),
      myStatus: expect.any(String),
      newestLikes: [],
    },
  });

  return body;
};
