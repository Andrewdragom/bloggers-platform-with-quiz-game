import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LikesForComment } from '../../domain/entities/likeForComment.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LikeStatusForCommentsRepositoryTypeOrm {
  constructor(
    @InjectRepository(LikesForComment)
    protected likeRepository: Repository<LikesForComment>,
  ) {}
  async saveStatus(likeStatus: LikesForComment) {
    return await this.likeRepository.save(likeStatus);
  }
}
