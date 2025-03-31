import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class EmailConfirmation {
  // @Column()
  // userId: string;
  @Column()
  confirmationCode: string;
  @Column()
  expirationDate: Date;
  @Column()
  isConfirmed: boolean;
  @PrimaryColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.emailConfirmations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  static createInstance(
    confirmationCode: string,
    expirationDate: Date,
    isConfirmed: boolean,
    user: User,
  ) {
    const emailConfirmation = new EmailConfirmation();
    emailConfirmation.id = crypto.randomUUID();
    emailConfirmation.confirmationCode = confirmationCode;
    emailConfirmation.expirationDate = expirationDate;
    emailConfirmation.isConfirmed = isConfirmed;
    emailConfirmation.user = user;
    return emailConfirmation;
  }
}
