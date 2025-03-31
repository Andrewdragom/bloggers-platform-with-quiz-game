import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { isUUID } from 'class-validator';

@Injectable()
export class BlogsRepositoryPostgres {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async findBlogs(
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    searchNameTerm: string | null,
  ) {
    const offset = (pageNumber - 1) * pageSize;

    const allBlogs = await this.dataSource.query(
      `
    SELECT * FROM blogs
    WHERE 
        (COALESCE($1, '') = '' OR name ILIKE '%' || $1 || '%')
    ORDER BY 
        CASE WHEN $2 = 'asc' THEN "${sortBy}" END ASC,
        CASE WHEN $2 = 'desc' THEN "${sortBy}" END DESC
    LIMIT $3 OFFSET $4;
    `,
      [searchNameTerm || '', sortDirection, pageSize, offset],
    );

    return allBlogs;
  }
  async getBlogsCount(searchNameTerm: any) {
    const result = await this.dataSource.query(
      `
    SELECT COUNT(*) as "totalCount"
    FROM blogs b
    WHERE 
      ($1::TEXT IS NULL OR b.name ILIKE '%' || $1::TEXT || '%')
    `,
      [
        searchNameTerm ? String(searchNameTerm).trim() : null, // Убираем лишние пробелы
      ],
    );

    return parseInt(result[0].totalCount, 10);
  }
  async createNewBlog(newBlog: any) {
    const result = await this.dataSource.query(
      `INSERT INTO blogs (name, description, "websiteUrl", "createdAt", "isMembership", id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *;`,
      [
        newBlog.name,
        newBlog.description,
        newBlog.websiteUrl,
        newBlog.createdAt,
        newBlog.isMembership,
        newBlog.id,
      ],
    );
    return result[0];
  }
  async findBlogById(id: string | null | undefined) {
    if (!isUUID(id)) {
      throw new NotFoundException('Блог не найден');
    }
    const foundBlog = await this.dataSource.query(
      `
      SELECT * FROM blogs WHERE id = $1 LIMIT 1;
      `,
      [id],
    );
    return foundBlog.length > 0 ? foundBlog[0] : null;
  }
  async deleteBlogById(id: string | null) {
    if (!isUUID(id)) {
      throw new NotFoundException('Блог не найден');
    }
    const result = await this.dataSource.query(
      `DELETE FROM blogs WHERE id = $1 RETURNING *;`,
      [id],
    );
    return result[1] > 0;
  }
  async updateBlogById(
    id: string,
    name: string,
    description: string,
    websiteUrl: string,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    UPDATE blogs
    SET 
      name = $2,
      description = $3,
      "websiteUrl" = $4
    WHERE id = $1
    RETURNING id;
    `,
      [id, name, description, websiteUrl],
    );

    return result.length > 0;
  }
}
