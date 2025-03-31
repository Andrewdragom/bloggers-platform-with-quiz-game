import { Column, Entity, OneToMany, PrimaryColumn, OneToOne } from 'typeorm';
import { NewPassword } from './newPassword.entity';
import { EmailConfirmation } from './emailConfirmation.entity';
import { CreateUserDto } from '../../dto/create-user.dto';
import { v4 as uuidv4 } from 'uuid';
import { Session } from './session.entity';
import { BaseEntity } from '../../../../core/domain/entities/base.entity';

@Entity()
export class User extends BaseEntity {
  // @PrimaryColumn('uuid')
  // id: string;
  @Column()
  login: string;
  @Column()
  email: string;
  @Column()
  passwordHash: string;
  @Column()
  passwordSalt: string;
  // @Column()
  // createdAt: Date;

  @OneToMany(
    () => EmailConfirmation,
    (emailConfirmation) => emailConfirmation.user,
  )
  emailConfirmations: EmailConfirmation[];

  @OneToOne(() => NewPassword, (newPassword) => newPassword.user, {
    cascade: true,
  })
  newPassword: NewPassword;

  @OneToMany(() => Session, (session) => session.userId)
  sessions: Session[];

  static createInstance(dto: CreateUserDto, passwordHash, passwordSalt): User {
    const user = new User();
    user.id = uuidv4();
    user.login = dto.login;
    user.email = dto.email;
    user.passwordHash = passwordHash;
    user.passwordSalt = passwordSalt;
    user.createdAt = new Date();

    return user;
  }
}
