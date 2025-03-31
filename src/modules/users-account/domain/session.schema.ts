import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SessionDocument = HydratedDocument<Session>;

@Schema({ collection: 'sessions' })
export class Session {
  @Prop()
  userId: string;
  @Prop()
  deviceIp: string;
  @Prop()
  deviceId: string;
  @Prop()
  deviceName: string;
  @Prop()
  issuedDate: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
