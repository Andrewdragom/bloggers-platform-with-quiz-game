import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { isUUID } from 'class-validator';

@Injectable()
export class PostsRepositoryPostgres {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async createPost(post: any) {
    const result = await this.dataSource.query(
      `INSERT INTO posts (id, title, "shortDescription", content, "blogId", "blogName", "createdAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *;`,
      [
        post.id,
        post.title,
        post.shortDescription,
        post.content,
        post.blogId,
        post.blogName,
        post.createdAt,
      ],
    );
    return result;
  }
  async findPostsByBlogId(
    id: string | null | undefined,
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
  ) {
    const offset = (pageNumber - 1) * pageSize;
    const foundPosts = await this.dataSource.query(
      `SELECT * FROM posts
 WHERE ("blogId" = $1)
ORDER BY 
        CASE WHEN $2 = 'asc' THEN "${sortBy}" END ASC,
        CASE WHEN $2 = 'desc' THEN "${sortBy}" END DESC
    LIMIT $3 OFFSET $4;`,
      [id, sortDirection, pageSize, offset],
    );
    return foundPosts;
  }
  async getPostsCountForBlog(id: string | null | undefined) {
    const result = await this.dataSource.query(
      `SELECT COUNT(*) as "totalCount"
      FROM posts p
      WHERE ("blogId" = $1)`,
      [id],
    );
    return parseInt(result[0].totalCount, 10);
  }
  async deletePostById(id: string | null | undefined) {
    if (!isUUID(id)) {
      throw new NotFoundException('Пост не найден');
    }
    const result = await this.dataSource.query(
      `DELETE FROM posts WHERE id = $1 RETURNING *;`,
      [id],
    );
    return result[1] > 0;
  }
  async updatePostById(
    id: string | undefined | null,
    title: string,
    content: string,
    shortDescription: string,
    blogId: string,
    blogName: string,
  ) {
    if (!isUUID(id)) {
      throw new NotFoundException('Пост не найден');
    }
    const result = await this.dataSource.query(
      `UPDATE posts
   SET 
     title = $2, 
     "content" = $3, 
     "shortDescription" = $4, 
     "blogId" = $5, 
     "blogName" = $6
   WHERE id = $1
   RETURNING id;`,
      [id, title, content, shortDescription, blogId, blogName],
    );

    return result.length > 0;
  }
  async findPosts(
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
  ) {
    const offset = (pageNumber - 1) * pageSize;

    const allPosts = await this.dataSource.query(
      `SELECT * FROM posts
ORDER BY 
        CASE WHEN $1 = 'asc' THEN "${sortBy}" END ASC,
        CASE WHEN $1 = 'desc' THEN "${sortBy}" END DESC
    LIMIT $2 OFFSET $3;
`,
      [sortDirection, pageSize, offset],
    );
    return allPosts;
  }
  async getPostsCount() {
    const result = await this.dataSource.query(
      `
    SELECT COUNT(*) as "totalCount"
    FROM posts p
 
    `,
    );

    return parseInt(result[0].totalCount, 10);
  }
  async findPostById(id: string | null | undefined) {
    if (!isUUID(id)) {
      throw new NotFoundException('Пост не найден');
    }
    const foundPost = await this.dataSource.query(
      `SELECT * FROM posts WHERE id = $1 LIMIT 1;`,
      [id],
    );
    return foundPost.length > 0 ? foundPost[0] : null;
  }
}
