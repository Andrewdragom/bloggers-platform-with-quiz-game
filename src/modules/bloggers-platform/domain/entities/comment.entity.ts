import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../../core/domain/entities/base.entity';
import { Post } from './post.entity';
import { User } from '../../../users-account/domain/entities/user.entity';
import { CreateCommentInputDto } from '../../api/input-dto/dto-comments/create-comment-input.dto';
import { LikesForComment } from './likeForComment.entity';

@Entity()
export class Comment extends BaseEntity {
  @Column()
  content: string;
  @ManyToOne(() => Post, (post) => post.comments)
  post: Post;
  @Column()
  postId: string;
  @ManyToOne(() => User, (user) => user.comments)
  user: User;
  @Column()
  userId: string;
  @OneToMany(
    () => LikesForComment,
    (likesForComment) => likesForComment.comment,
  )
  likes: LikesForComment[];

  static createInstanceComment(
    dto: CreateCommentInputDto,
    post: Post,
    user: User,
  ): Comment {
    const comment = new Comment();
    comment.id = crypto.randomUUID();
    comment.content = dto.content;
    comment.createdAt = new Date();
    comment.post = post;
    comment.user = user;

    return comment;
  }

  updateComment(content: string) {
    if (content) this.content = content;
    this.updatedAt = new Date();
  }
}
