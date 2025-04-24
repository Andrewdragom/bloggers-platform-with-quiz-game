import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LikeForPost } from '../../domain/entities/likeForPost.entity';

@Injectable()
export class LikeStatusForPostsRepositoryTypeOrm {
  constructor(
    @InjectRepository(LikeForPost)
    protected likeRepository: Repository<LikeForPost>,
  ) {}
  async saveStatus(likeStatus: LikeForPost) {
    return await this.likeRepository.save(likeStatus);
  }
}
