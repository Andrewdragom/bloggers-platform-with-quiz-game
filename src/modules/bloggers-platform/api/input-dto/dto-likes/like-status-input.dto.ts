import { IsEnum, IsNotEmpty } from 'class-validator';
import { LikeStatus } from './like-status-enum';

export class CreateLikeStatusInputDto {
  @IsNotEmpty()
  @IsEnum(LikeStatus, { message: 'Like status already exists' })
  likeStatus: LikeStatus;
}
