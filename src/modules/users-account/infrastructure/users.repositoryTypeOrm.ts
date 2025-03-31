import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../domain/entities/user.entity';
import { Repository } from 'typeorm';
import { EmailConfirmation } from '../domain/entities/emailConfirmation.entity';
import { add } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { NewPassword } from '../domain/entities/newPassword.entity';

export class UsersRepositoryTypeOrm {
  constructor(
    @InjectRepository(User) protected userRepository: Repository<User>,
    @InjectRepository(EmailConfirmation)
    protected emailConfirmationRepository: Repository<EmailConfirmation>,
  ) {}

  async findByLoginOrEmail(loginOrEmail: string) {
    const result = await this.userRepository.find({
      where: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
    return result[0];
  }
  async createNewUser(newUser: any) {
    const result = await this.userRepository.save(newUser);
    if (newUser.emailConfirmation) {
      const emailConfirmation = EmailConfirmation.createInstance(
        newUser.emailConfirmation.confirmationCode,
        newUser.emailConfirmation.expirationDate,
        newUser.emailConfirmation.isConfirmed,
        result,
      );
      await this.emailConfirmationRepository.save(emailConfirmation);
    }

    return result;
  }
  async deleteUserByID(id: string | null) {
    if (!id) return false;

    const result = await this.userRepository.delete({ id });
    return !!result.affected;
  }
  async findUserByID(id: string | undefined) {
    return await this.userRepository.findOneBy({ id });
  }
  async findUserByCode(code: object) {
    const queryBuilder = this.userRepository
      .createQueryBuilder('u')
      .innerJoin('u.emailConfirmations', 'e')
      .select([
        'u.id',
        'u.login',
        'u.email',
        'u.passwordHash',
        'u.passwordSalt',
        'u.createdAt',
        'e.confirmationCode',
        'e.expirationDate',
        'e.isConfirmed',
      ])
      .where('e.confirmationCode = :code', { code: code })
      .limit(1);

    const result = await queryBuilder.getRawOne(); // Возвращает одну запись или null
    if (!result) {
      return null;
    }

    return {
      id: result.u_id,
      login: result.u_login,
      email: result.u_email,
      passwordHash: result.u_passwordHash,
      passwordSalt: result.u_passwordSalt,
      createdAt: result.u_createdAt,
      emailConfirmation: {
        confirmationCode: result.e_confirmationCode,
        expirationDate: result.e_expirationDate,
        isConfirmed: result.e_isConfirmed,
      },
    };
  }
  async updateConfirmation(userId: string) {
    const queryBuilder =
      this.emailConfirmationRepository.createQueryBuilder('e');
    const result = await queryBuilder
      .update()
      .set({ isConfirmed: true })
      .where('userId=:userId', { userId })
      .execute();

    return !!result.affected;
  }
  async findEmailUserForResendCode(email: string) {
    const queryBuilder = this.userRepository
      .createQueryBuilder('u')
      .innerJoin('u.emailConfirmations', 'e')
      .select([
        'u.id',
        'u.login',
        'u.email',
        'u.passwordHash',
        'u.passwordSalt',
        'u.createdAt',
        'e.confirmationCode',
        'e.expirationDate',
        'e.isConfirmed',
      ])
      .where('u.email = :email', { email: email })
      .limit(1);

    const result = await queryBuilder.getRawOne(); // Возвращает одну запись или null
    if (!result) {
      return null;
    }

    return {
      id: result.u_id,
      login: result.u_login,
      email: result.u_email,
      passwordHash: result.u_passwordHash,
      passwordSalt: result.u_passwordSalt,
      createdAt: result.u_createdAt,
      emailConfirmation: {
        confirmationCode: result.e_confirmationCode,
        expirationDate: result.e_expirationDate,
        isConfirmed: result.e_isConfirmed,
      },
    };
  }
  async updateUserCodeForResend(userId: string, code: string) {
    const queryBuilder =
      this.emailConfirmationRepository.createQueryBuilder('e');
    const result = await queryBuilder
      .update()
      .set({
        confirmationCode: code,
        expirationDate: add(new Date(), {
          hours: 1,
          minutes: 0,
        }),
      })
      .where('userId=:userId', { userId })
      .execute();

    return !!result.affected;
  }
  async enterCodeForNewPassword(email: string, code: string) {
    const user = await this.userRepository.findOne({
      where: { email: email },
      relations: ['newPassword'],
    });
    if (!user) {
      return false;
    }

    const newPassword = new NewPassword();
    newPassword.id = uuidv4();
    newPassword.confirmationCode = code;
    newPassword.user = user;
    user.newPassword = newPassword;
    await this.userRepository.save(user);
    return true;
  }
  async findUserByCodeForNewPassword(code: string | null) {
    const queryBuilder = this.userRepository
      .createQueryBuilder('u')
      .innerJoin('u.newPassword', 'n')
      .select(['u.id', 'n.confirmationCode'])
      .where('n.confirmationCode = :confirmationCode', {
        confirmationCode: code,
      })
      .limit(1);

    const result = await queryBuilder.getOne(); // Вместо getRowOne
    if (!result) {
      return null;
    }
    return {
      id: result.id,
    };
  }
  async changePassword(
    userId: string,
    passwordSalt: string,
    passwordHash: string,
  ) {
    const queryBuilder = this.userRepository.createQueryBuilder('u');
    const result = await queryBuilder
      .update()
      .set({ passwordSalt: passwordSalt, passwordHash: passwordHash })
      .where('id=:id', { id: userId })
      .execute();

    return !!result.affected;
  }
}
