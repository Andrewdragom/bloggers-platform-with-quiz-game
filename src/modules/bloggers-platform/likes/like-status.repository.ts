import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Like } from './likes.schema';

export class LikeStatusRepository {
  constructor(@InjectModel('likeStatus') private likeModel: Model<Like>) {}
  async saveStatus(status: object) {
    const result = await this.likeModel.create(status);
    return result;
  }
  async getStatus(id: string, userId: string) {
    const result = await this.likeModel.findOne({
      commentId: id,
      userId: userId,
    });
    return result;
  }
  async updateStatus(id: string, status: string) {
    const result = await this.likeModel.updateOne(
      { commentId: id },
      { $set: { likeStatus: status } },
    );
    return result;
  }
  async countLike(commentId: string, likeStatus: string) {
    const filter: any = {};
    if (likeStatus) {
      filter.commentId = commentId;
      filter.likeStatus = { $regex: likeStatus };
    }
    // if (commentId){
    //     filter.commentId = commentId
    // }

    return this.likeModel.countDocuments(filter);
  }
  async getLast3Likes(id: string) {
    const result = await this.likeModel
      .find({ commentId: id, likeStatus: 'Like' })
      .limit(3)
      .sort({ ['addedAt']: -1 });
    return result;
  }
}
