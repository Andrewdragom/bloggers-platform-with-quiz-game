import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { isUUID } from 'class-validator';

@Injectable()
export class CommentsRepositoryPostgres {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async createNewComment(newComment: any) {
    const result = await this.dataSource.query(
      `INSERT INTO comments (id, content, "userId", "userLogin", "createdAt", "postId")
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`,
      [
        newComment.id,
        newComment.content,
        newComment.commentatorInfo.userId,
        newComment.commentatorInfo.userLogin,
        newComment.createdAt,
        newComment.postId,
      ],
    );
    return result[0];
  }
  async findCommentById(id: string | null | undefined) {
    if (!isUUID(id)) {
      throw new NotFoundException('Коммент не найден');
    }
    const foundComment = await this.dataSource.query(
      `
      SELECT * FROM comments WHERE id = $1 LIMIT 1;
      `,
      [id],
    );
    return foundComment.length > 0
      ? {
          id: foundComment[0].id,
          content: foundComment[0].content,
          commentatorInfo: {
            userId: foundComment[0].userId,
            userLogin: foundComment[0].userLogin,
          },
          createdAt: foundComment[0].createdAt,
        }
      : null;
  }
  async findCommentByPostId(
    id: string,
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
  ) {
    const offset = (pageNumber - 1) * pageSize;
    const allComments = await this.dataSource.query(
      `SELECT * FROM comments
 WHERE ("postId" = $1)
 ORDER BY 
        CASE WHEN $2 = 'asc' THEN "${sortBy}" END ASC,
        CASE WHEN $2 = 'desc' THEN "${sortBy}" END DESC
    LIMIT $3 OFFSET $4;
`,
      [id, sortDirection, pageSize, offset],
    );

    const mapAllComments = allComments.map((comment) => {
      return {
        id: comment.id,
        content: comment.content,
        commentatorInfo: {
          userId: comment.userId,
          userLogin: comment.userLogin,
        },
        createdAt: comment.createdAt,
      };
    });
    return mapAllComments;
  }
  async getCommentsCountForPost(id: string | null | undefined) {
    const result = await this.dataSource.query(
      `SELECT COUNT(*) as "totalCount"
      FROM comments c
      WHERE ("postId" = $1)`,
      [id],
    );
    return parseInt(result[0].totalCount, 10);
  }
  async updateCommentById(id: string, content: string) {
    const result = await this.dataSource.query(
      `UPDATE comments 
      SET
      content = $2
      WHERE "id" = $1
      RETURNING id;`,
      [id, content],
    );
    return result[1] > 0;
  }
  async deleteBlogById(id: string | null | undefined) {
    if (!isUUID(id)) {
      throw new NotFoundException('Коммент не найден');
    }
    const result = await this.dataSource.query(
      `DELETE FROM comments WHERE id = $1 RETURNING *;`,
      [id],
    );
    return result[1] > 0;
  }
}
