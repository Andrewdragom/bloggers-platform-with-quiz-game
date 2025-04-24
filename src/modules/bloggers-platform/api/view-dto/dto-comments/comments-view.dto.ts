export class LikesInfo {
  likesCount: number;
  dislikesCount: number;
  myStatus: 'None' | 'Like' | 'Dislike';
}

export class CommentatorInfo {
  userId: string;
  userLogin: string;
}

export class CommentsViewDto {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: Date;
  likesInfo: LikesInfo;
}
