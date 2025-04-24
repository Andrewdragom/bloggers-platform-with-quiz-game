import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Blog } from '../domain/entities/blog.entity';
import { Post } from '../domain/entities/post.entity';
import { closeTestApp, createTestApp } from '../../../../test/setup';

describe('BlogsController (e2e)', () => {
  let app: INestApplication;
  let blogRepository: Repository<Blog>;
  let postRepository: Repository<Post>;

  beforeAll(async () => {
    app = await createTestApp();
    blogRepository = app.get(getRepositoryToken(Blog));
    postRepository = app.get(getRepositoryToken(Post));
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  beforeEach(async () => {
    // Очищаем таблицы перед каждым тестом
    await postRepository.query('DELETE FROM post');
    await blogRepository.query('DELETE FROM blog');
  });

  describe('GET /blogs/:blogId/posts', () => {
    it('should return posts for a specific blog with pagination', async () => {
      // Создаём тестовый блог
      const blog = await blogRepository.save({
        id: 'ed459b77-587e-46ac-b096-854e61964b8d',
        name: 'Test Blog',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Создаём тестовые посты
      const posts = Array.from({ length: 12 }, (_, i) => ({
        id: `post-${i}`,
        title: `Post ${i}`,
        shortDescription: 'description',
        content: 'content',
        blogId: blog.id,
        createdAt: new Date(`2025-04-20T16:28:${55 + i}.000Z`),
        updatedAt: new Date(),
      }));
      await postRepository.save(posts);

      // Выполняем запрос
      const response = await request(app.getHttpServer())
        .get(`/blogs/${blog.id}/posts`)
        .query({ pageNumber: 1, pageSize: 10 })
        .expect(200);

      // Проверяем ответ
      expect(response.body).toEqual({
        pagesCount: 2,
        page: 1,
        pageSize: 10,
        totalCount: 12,
        items: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            title: expect.any(String),
            shortDescription: 'description',
            content: 'content',
            blogId: blog.id,
            blogName: 'Test Blog',
            createdAt: expect.any(String),
            extendedLikesInfo: {
              likesCount: 0,
              dislikesCount: 0,
              myStatus: 'None',
              newestLikes: [],
            },
          }),
        ]),
      });
      expect(response.body.items).toHaveLength(10); // Проверяем пагинацию
    });

    it('should return 404 if blog does not exist', async () => {
      const nonExistentBlogId = 'non-existent-id';
      await request(app.getHttpServer())
        .get(`/blogs/${nonExistentBlogId}/posts`)
        .query({ pageNumber: 1, pageSize: 10 })
        .expect(404);
    });
  });
});
