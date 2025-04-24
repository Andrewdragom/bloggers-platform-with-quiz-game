import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from '../../domain/entities/post.entity';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';
import { PostsViewDto } from '../../api/view-dto/dto-posts/posts-view.dto';
import { LikeForPost } from '../../domain/entities/likeForPost.entity';

@Injectable()
export class PostsQueryRepositoryTypeOrm {
  constructor(
    @InjectRepository(Post) protected postsRepository: Repository<Post>,
    @InjectRepository(LikeForPost)
    protected likeRepository: Repository<LikeForPost>,
  ) {}
  async findPostsByBlogId(
    id: string | null | undefined,
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
  ): Promise<PostsViewDto[]> {
    const offset = (pageNumber - 1) * pageSize;

    const queryBuilder = this.postsRepository
      .createQueryBuilder('p')
      .leftJoin('p.blog', 'blog')
      .leftJoin('p.likes', 'likes')
      .select([
        'p.id as "id"',
        'p.title as "title"',
        'p.shortDescription as "shortDescription"',
        'p.content as "content"',
        'p.blogId as "blogId"',
        'blog.name as "blogName"',
        'p.createdAt as "createdAt"',
      ])
      .addSelect(
        // Считаем количество лайков (likeStatus = 'LIKE')
        `COUNT(CASE WHEN likes.likeStatus = 'Like' THEN 1 END)`,
        'likesCount',
      )
      .addSelect(
        // Считаем количество дизлайков (likeStatus = 'DISLIKE')
        `COUNT(CASE WHEN likes.likeStatus = 'Dislike' THEN 1 END)`,
        'dislikesCount',
      )
      .groupBy('p.id , blog.name')
      .where('blog.id = :id', { id }); // Условие по blogId
    // Добавляем сортировку
    const validSortFields = [
      'id',
      'title',
      'shortDescription',
      'content',
      'createdAt',
      'updatedAt',
      'blogName',
    ];
    const direction = sortDirection.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    if (!validSortFields.includes(sortBy)) {
      sortBy = 'createdAt'; // По умолчанию сортируем по createdAt
    }

    if (sortBy === 'blogName') {
      queryBuilder.orderBy('blog.name', direction); // Сортируем по имени блога
    } else {
      queryBuilder.orderBy(`p.${sortBy}`, direction); // Сортируем по полю поста
    }

    // Добавляем пагинацию
    queryBuilder.limit(pageSize).offset(offset);
    return queryBuilder.getRawMany();
  }
  async getPostsCountForBlog(id: string | null | undefined): Promise<number> {
    const queryBuilder = this.postsRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.blog', 'blog')
      .where('blog.id = :id', { id });

    return await queryBuilder.getCount();
  }
  async findPostById(id: string | null | undefined) {
    if (!isUUID(id) || id === null) {
      throw new NotFoundException('Пост не найден');
    }
    const queryBuilder = this.postsRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.blog', 'blog')
      .where('p.id = :id', { id });
    return queryBuilder.getOne();
  }
  async findPostByIdRaw(id: string | null | undefined) {
    if (!isUUID(id) || id === null) {
      throw new NotFoundException('Пост не найден');
    }
    const queryBuilder = this.postsRepository
      .createQueryBuilder('p')
      .leftJoin('p.blog', 'blog')
      .leftJoin('p.likes', 'likes')
      .select([
        'p.id as "id"',
        'p.title as "title"',
        'p.shortDescription as "shortDescription"',
        'p.content as "content"',
        'p.blogId as "blogId"',
        'blog.name as "blogName"',
        'p.createdAt as "createdAt"',
      ])
      .addSelect(
        // Считаем количество лайков (likeStatus = 'LIKE')
        `COUNT(CASE WHEN likes.likeStatus = 'Like' THEN 1 END)`,
        'likesCount',
      )
      .addSelect(
        // Считаем количество дизлайков (likeStatus = 'DISLIKE')
        `COUNT(CASE WHEN likes.likeStatus = 'Dislike' THEN 1 END)`,
        'dislikesCount',
      )
      .groupBy('p.id , blog.name')
      .where('p.id = :id', { id });
    return queryBuilder.getRawOne();
  }
  async findPosts(
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    userId: string | null,
  ): Promise<any> {
    const offset = (pageNumber - 1) * pageSize;

    const queryBuilder = this.postsRepository
      .createQueryBuilder('p')
      .leftJoin('p.blog', 'blog')
      .leftJoin('p.likes', 'likes')
      .select([
        'p.id as "id"',
        'p.title as "title"',
        'p.shortDescription as "shortDescription"',
        'p.content as "content"',
        'p.blogId as "blogId"',
        'blog.name as "blogName"',
        'p.createdAt as "createdAt"',
      ])
      .addSelect(
        // Считаем количество лайков (likeStatus = 'LIKE')
        `COUNT(CASE WHEN likes.likeStatus = 'Like' THEN 1 END)`,
        'likesCount',
      )
      .addSelect(
        // Считаем количество дизлайков (likeStatus = 'DISLIKE')
        `COUNT(CASE WHEN likes.likeStatus = 'Dislike' THEN 1 END)`,
        'dislikesCount',
      )
      .addSelect(
        userId
          ? `(SELECT l."likeStatus" FROM like_for_post l WHERE l."postId" = p.id AND l."userId" = :userId)`
          : `'None'`,
        'myStatus',
      )
      .groupBy('p.id , blog.name');
    // Добавляем сортировку
    const validSortFields = [
      'id',
      'title',
      'shortDescription',
      'content',
      'createdAt',
      'updatedAt',
      'blogName',
    ];
    const direction = sortDirection.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    if (!validSortFields.includes(sortBy)) {
      sortBy = 'createdAt'; // По умолчанию сортируем по createdAt
    }

    if (sortBy === 'blogName') {
      queryBuilder.orderBy('blog.name', direction); // Сортируем по имени блога
    } else {
      queryBuilder.orderBy(`p.${sortBy}`, direction); // Сортируем по полю поста
    }

    // Добавляем пагинацию
    queryBuilder.limit(pageSize).offset(offset);
    if (userId) {
      queryBuilder.setParameter('userId', userId);
    }

    const posts = await queryBuilder.getRawMany();
    let lastLikes: any[] = [];
    const postIds = posts.map((p) => p.id);
    if (postIds.length > 0) {
      lastLikes = await this.likeRepository
        .createQueryBuilder('l')
        .leftJoin('l.user', 'u')
        .select([
          'l.postId as "postId"',
          'l.createdAt as "addedAt"',
          'l.userId as "userId"',
          'u.login as "login"',
        ])
        .where('l.postId IN (:...postIds)', { postIds })
        .andWhere('l.likeStatus = :likeStatus', { likeStatus: 'Like' })
        .orderBy('l.createdAt', 'DESC')
        .take(pageSize * 3)
        .getRawMany();
    } else {
      console.log('No posts found, skipping lastLikes query');
    }

    return posts.map((post) => ({
      id: post.id as string,
      title: post.title as string,
      shortDescription: post.shortDescription as string,
      content: post.content as string,
      blogId: post.blogId as string,
      blogName: post.blogName as string,
      createdAt: post.createdAt as Date,
      extendedLikesInfo: {
        likesCount: Number(post.likesCount),
        dislikesCount: Number(post.dislikesCount),
        myStatus: post.myStatus || ('None' as string),
        newestLikes: lastLikes
          .filter((like) => like.postId === post.id)
          .slice(0, 3)
          .map((like) => ({
            addedAt: like.addedAt as Date,
            userId: like.userId as string,
            login: like.login as string,
          })),
      },
    }));
  }
  async getPostsCount(): Promise<number> {
    const queryBuilder = this.postsRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.blog', 'blog');

    return await queryBuilder.getCount();
  }
}
