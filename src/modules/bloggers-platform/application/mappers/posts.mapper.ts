import { Injectable } from '@nestjs/common';
import {
  ExtendedLikesInfo,
  PostsViewDto,
} from '../../api/view-dto/dto-posts/posts-view.dto';
import { Post } from '../../domain/entities/post.entity';

@Injectable()
export class PostsMapper {
  toViewAfterCreate(post: Post): PostsViewDto {
    const dto = new PostsViewDto();
    const dtoExtendedLikesInfo = new ExtendedLikesInfo();
    dto.id = post.id;
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blog.id;
    dto.blogName = post.blog.name;
    dto.createdAt = post.createdAt;
    dtoExtendedLikesInfo.likesCount = 0;
    dtoExtendedLikesInfo.dislikesCount = 0;
    dtoExtendedLikesInfo.myStatus = 'None';
    dtoExtendedLikesInfo.newestLikes = [];
    dto.extendedLikesInfo = dtoExtendedLikesInfo;

    return dto;
  }
  toViewFindById(
    post: Post,
    countLike: number,
    countDislike: number,
    status: 'Like' | 'Dislike',
  ): PostsViewDto {
    const dto = new PostsViewDto();
    const dtoExtendedLikesInfo = new ExtendedLikesInfo();
    dto.id = post.id;
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blog.id;
    dto.blogName = post.blog.name;
    dto.createdAt = post.createdAt;
    dtoExtendedLikesInfo.likesCount = countLike;
    dtoExtendedLikesInfo.dislikesCount = countDislike;
    dtoExtendedLikesInfo.myStatus = status ? status : 'None';
    dtoExtendedLikesInfo.newestLikes = [];
    dto.extendedLikesInfo = dtoExtendedLikesInfo;

    return dto;
  }
}
