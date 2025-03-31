import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { isUUID } from 'class-validator';

@Injectable()
export class LikeStatusForCommentsRepositoryPostgres {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async saveStatus(status: any) {
    const result = await this.dataSource.query(
      `INSERT INTO "likesForComments" (id, "commentId", "userId", "likeStatus", "addedAt")
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;`,
      [
        crypto.randomUUID(),
        status.commentId,
        status.userId,
        status.likeStatus,
        status.addedAt,
      ],
    );
    return result;
  }
  async countLike(commentId: string, likeStatus: string) {
    const result = await this.dataSource.query(
      `SELECT COUNT(*) as "totalCount"
      FROM "likesForComments" l
      WHERE ("commentId" = $1)
      AND ("likeStatus" = $2)`,
      [commentId, likeStatus],
    );
    return parseInt(result[0].totalCount, 10);
  }
  async getStatus(id: string, userId: string) {
    if (!isUUID(id)) {
      throw new NotFoundException('Пост не найден');
    }
    const result = await this.dataSource.query(
      `
    SELECT * FROM "likesForComments" 
    WHERE ("commentId" = $1) 
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
    UPDATE "likesForComments"
    SET 
    "likeStatus" = $2
    WHERE "commentId" = $1
    RETURNING *;`,
      [id, status],
    );

    return result.length > 0;
  }
  // async getStatus(id: string, userId: string) {
  //   const result = await this.dataSource.query(
  //     `SELECT * FROM "likesForComments"
  //       WHERE ("commentId" = $1)
  //       AND ("userId" = $2)
  //       LIMIT 1;`,
  //     [id, userId],
  //   );
  //   return result;
  // }
}
