import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { isUUID } from 'class-validator';

@Injectable()
export class LikeStatusForPostsRepositoryPostgres {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async saveStatus(status: any) {
    const result = await this.dataSource.query(
      `INSERT INTO "likesForPosts" (id, "postId", "userId", "likeStatus", "addedAt")
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;`,
      [
        crypto.randomUUID(),
        status.postId,
        status.userId,
        status.likeStatus,
        status.addedAt,
      ],
    );
    return result;
  }
  async countLike(postId: string, likeStatus: string) {
    const result = await this.dataSource.query(
      `SELECT COUNT(*) as "totalCount"
      FROM "likesForPosts" l
      WHERE ("postId" = $1)
      AND ("likeStatus" = $2)`,
      [postId, likeStatus],
    );
    return parseInt(result[0].totalCount, 10);
  }
  async getStatus(id: string, userId: string) {
    if (!isUUID(id)) {
      throw new NotFoundException('Пост не найден');
    }
    const result = await this.dataSource.query(
      `
    SELECT * FROM "likesForPosts" 
    WHERE ("postId" = $1) 
    AND ("userId" = $2);`,
      [id, userId],
    );
    return result.length > 0 ? result[0] : null;
  }
  async updateStatus(id: string, status: string) {
    if (!isUUID(id)) {
      throw new NotFoundException('Пост не найден');
    }
    const result = await this.dataSource.query(
      `
    UPDATE "likesForPosts"
    SET 
    "likeStatus" = $2
    WHERE "postId" = $1
    RETURNING *;`,
      [id, status],
    );

    return result.length > 0;
  }
  async getLast3Likes(id: string) {
    const result = await this.dataSource.query(
      `SELECT * FROM "likesForPosts"
        WHERE "postId" = $1 
        AND ("likeStatus" = $3)
        ORDER BY
         CASE WHEN $2 = 'asc' THEN "addedAt" END DESC
        LIMIT 3;`,
      [id, 'asc', 'Like'],
    );
    return result;
  }
}
