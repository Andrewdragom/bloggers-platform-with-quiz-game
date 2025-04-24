import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../../core/domain/entities/base.entity';
import { Comment } from './comment.entity';
import { User } from '../../../users-account/domain/entities/user.entity';

@Entity('likes_for_comment')
export class LikesForComment extends BaseEntity {
  @Column()
  likeStatus: string;

  @ManyToOne(() => Comment, (comment) => comment.likes, {
    onDelete: 'CASCADE',
  })
  comment: Comment;
  @Column()
  commentId: string;

  @ManyToOne(() => User, (user) => user.likesForComments)
  user: User;
  @Column()
  userId: string;

  static createInstanceLikeStatus(
    id: string,
    userId: string,
    likeStatus: string,
  ): LikesForComment {
    const status = new LikesForComment();
    status.id = crypto.randomUUID();
    status.userId = userId;
    status.likeStatus = likeStatus;
    status.commentId = id;

    return status;
  }

  updateStatus(likeStatus: string) {
    if (likeStatus) this.likeStatus = likeStatus;
    this.updatedAt = new Date();
  }
}
