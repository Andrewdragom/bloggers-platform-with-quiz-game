import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../../core/domain/entities/base.entity';
import { User } from '../../../users-account/domain/entities/user.entity';
import { Post } from './post.entity';

@Entity()
@Index('idx_like_for_post_postId_likeStatus_createdAt', [
  'postId',
  'likeStatus',
  'createdAt',
])
export class LikeForPost extends BaseEntity {
  @Column()
  likeStatus: string;

  @ManyToOne(() => User, (user) => user.likesForComments)
  user: User;
  @Column()
  userId: string;

  @ManyToOne(() => Post, (post) => post.likes, {
    onDelete: 'CASCADE',
  })
  post: Post;
  @Column()
  postId: string;

  static createInstanceLikeStatus(
    id: string,
    userId: string,
    likeStatus: string,
  ): LikeForPost {
    const status = new LikeForPost();
    status.id = crypto.randomUUID();
    status.userId = userId;
    status.likeStatus = likeStatus;
    status.postId = id;

    return status;
  }

  updateStatus(likeStatus: string) {
    if (likeStatus) this.likeStatus = likeStatus;
    this.updatedAt = new Date();
  }
}
