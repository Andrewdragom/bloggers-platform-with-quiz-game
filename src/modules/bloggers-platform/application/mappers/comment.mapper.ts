import { Injectable } from '@nestjs/common';
import { Comment } from '../../domain/entities/comment.entity';
import {
  CommentatorInfo,
  CommentsViewDto,
  LikesInfo,
} from '../../api/view-dto/dto-comments/comments-view.dto';
import { User } from '../../../users-account/domain/entities/user.entity';

@Injectable()
export class CommentMapper {
  toViewAfterCreate(newComment: Comment, user: User): CommentsViewDto {
    const dto = new CommentsViewDto();
    const dtoExtendedLikesInfo = new LikesInfo();
    const dtoCommentatorInfo = new CommentatorInfo();
    dto.id = newComment.id;
    dto.content = newComment.content;
    dtoCommentatorInfo.userId = user.id;
    dtoCommentatorInfo.userLogin = user.login;
    dtoExtendedLikesInfo.dislikesCount = 0;
    dtoExtendedLikesInfo.likesCount = 0;
    dtoExtendedLikesInfo.myStatus = 'None';
    dto.commentatorInfo = dtoCommentatorInfo;
    dto.createdAt = newComment.createdAt;
    dto.likesInfo = dtoExtendedLikesInfo;

    return dto;
  }
}
