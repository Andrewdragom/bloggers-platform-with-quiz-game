// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { SessionDocument } from '../domain/session.schema';
//
// export class SessionRepositoryMongo {
//   constructor(
//     @InjectModel('sessions') private sessionModel: Model<SessionDocument>,
//   ) {}
//   async saveSession(session: any) {
//     const result = await this.sessionModel.create(session);
//     return result;
//   }
//   async getSessionByIssuedDate(issuedDate: any) {
//     const result = await this.sessionModel.findOne({ issuedDate: issuedDate });
//     return result;
//   }
//   async updateSessionDate(deviceId: string, issuedDate: any) {
//     const result = await this.sessionModel.updateOne(
//       { deviceId },
//       { $set: { issuedDate: issuedDate } },
//     );
//     if (result) return true;
//     else return false;
//   }
//   async getAllSessionsByUserId(userId: string) {
//     const result = await this.sessionModel.find({ userId: userId });
//     return result;
//   }
//   async deleteAllSessionsByDeviceId(deviceId: string) {
//     const result = await this.sessionModel.deleteMany({
//       deviceId: { $ne: deviceId },
//     });
//     if (result.deletedCount === 1) return true;
//     else return false;
//   }
//   async getAllSessionsByDeviceId(deviceId: string) {
//     const result = await this.sessionModel.findOne({ deviceId: deviceId });
//     return result;
//   }
//   async deleteSessionsByDeviceId(deviceId: string) {
//     const result = await this.sessionModel.deleteOne({ deviceId: deviceId });
//     if (result.deletedCount === 1) return true;
//     else return false;
//   }
// }
