import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Session {
  @PrimaryColumn('uuid')
  id: string;
  @Column()
  userId: string;
  @Column()
  deviceIp: string;
  @Column()
  deviceId: string;
  @Column()
  deviceName: string;
  @Column()
  issuedDate: Date;
  @ManyToOne(() => User, (user) => user.sessions)
  user: User;
}
