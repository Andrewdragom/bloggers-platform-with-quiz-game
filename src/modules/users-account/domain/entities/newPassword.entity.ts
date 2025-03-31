import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class NewPassword {
  @PrimaryColumn('uuid')
  id: string;
  @Column()
  confirmationCode: string;

  @ManyToOne(() => User, (user) => user.newPassword, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;
}
