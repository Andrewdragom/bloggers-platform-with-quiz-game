import { Column, Entity, OneToMany, PrimaryColumn, OneToOne } from 'typeorm';
import { NewPassword } from './newPassword.entity';
import { EmailConfirmation } from './emailConfirmation.entity';
import { CreateUserDto } from '../../dto/create-user.dto';
import { v4 as uuidv4 } from 'uuid';
import { Session } from './session.entity';
import { BaseEntity } from '../../../../core/domain/entities/base.entity';
import { Comment } from '../../../bloggers-platform/domain/entities/comment.entity';
import { LikesForComment } from '../../../bloggers-platform/domain/entities/likeForComment.entity';
import { Game } from '../../../quiz/domain/entities/game.entity';
import { Answer } from '../../../quiz/domain/entities/answer.entity';
import { Player } from '../../../quiz/domain/entities/player.entity';

@Entity()
export class User extends BaseEntity {
  @Column()
  login: string;
  @Column()
  email: string;
  @Column()
  passwordHash: string;
  @Column()
  passwordSalt: string;

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

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => LikesForComment, (likesForComment) => likesForComment.user)
  likesForComments: LikesForComment[];

  @OneToMany(() => Game, (game) => game.firstPlayer)
  game1: Game[];
  @OneToMany(() => Game, (game) => game.secondPlayer)
  game2: Game[];
  @OneToMany(() => Answer, (answer) => answer.user)
  answers: Answer[];
  @OneToMany(() => Player, (player) => player.user)
  player: Player[];

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
