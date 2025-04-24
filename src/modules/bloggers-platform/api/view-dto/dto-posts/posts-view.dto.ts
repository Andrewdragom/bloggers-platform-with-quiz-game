export class NewestLikes {
  addedAt: Date;
  userId: string;
  login: string;
}

export class ExtendedLikesInfo {
  likesCount: number;
  dislikesCount: number;
  myStatus: 'None' | 'Like' | 'Dislike';
  newestLikes: NewestLikes[];
}

export class PostsViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: ExtendedLikesInfo;
  likesCount: number;
  dislikesCount: number;
  // myStatus: 'None' | 'Like' | 'Dislike' | null;
}
