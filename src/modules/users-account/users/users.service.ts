import {
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import * as bcrypt from 'bcrypt';
import { User } from './users.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { EmailService } from '../../notifications/email.service';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';

@Injectable()
export class UsersService {
  constructor(
    @Inject(UsersRepository) protected usersRepository: UsersRepository,
    @Inject(EmailService) protected emailService: EmailService,
  ) {}
  async findUsers(
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    searchLoginTerm: any,
    searchEmailTerm: any,
  ) {
    const allUsers = await this.usersRepository.findUsers(
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      searchLoginTerm,
      searchEmailTerm,
    );
    const filterUsers = allUsers.map((el) => {
      const user = {
        id: el.id,
        login: el.login,
        email: el.email,
        createdAt: el.createdAt,
      };
      return user;
    });
    const usersCount = await this.usersRepository.getUsersCount(
      searchLoginTerm,
      searchEmailTerm,
    );

    return {
      pagesCount: Math.ceil(usersCount / pageSize),
      page: pageNumber,
      pageSize,
      totalCount: usersCount,
      items: filterUsers,
    };
  }
  async checkLogin(login: string) {
    const checkLogin = await this.usersRepository.findLoginUserForCheck(login);
    if (checkLogin.length >= 1) {
      throw new HttpException(
        [{ message: 'login should be unique', field: 'login' }],
        400,
      );
    }
    return checkLogin;
  }
  async checkEmail(email: string) {
    const checkEmail = await this.usersRepository.findEmailUserForCheck(email);
    if (checkEmail.length >= 1) {
      throw new HttpException(
        [{ message: 'email should be unique', field: 'email' }],
        400,
      );
    }
    return checkEmail;
  }
  async _generateHash(password: string, salt: any) {
    const hash = await bcrypt.hash(password, salt);
    return hash;
  }
  async createNewUser(body: CreateUserDto) {
    if (!body.login || !body.password || !body.email) {
      throw new Error('invalid date');
    }

    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this._generateHash(body.password, passwordSalt);

    const newUser = User.createInstance(body, passwordHash, passwordSalt);

    await this.usersRepository.createNewUser(newUser);
    return {
      id: newUser.id,
      login: newUser.login,
      email: newUser.email,
      createdAt: newUser.createdAt,
    };
  }
  async deleteUserById(id: string | null) {
    const result = await this.usersRepository.deleteUserByID(id);
    if (!result) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return result;
  }
  async checkCredentials(loginOrEmail: string, password: string) {
    const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail);
    if (!user) return false;
    const passwordHash = await this._generateHash(password, user.passwordSalt);
    if (user.passwordHash != passwordHash) {
      return false;
    }
    return user;
  }
  async findUserById(id: string | null) {
    const foundUser = await this.usersRepository.findUserByID(id);
    if (!foundUser) return null;
    else
      return {
        email: foundUser.email,
        login: foundUser.login,
        userId: foundUser.id,
      };
  }
  async createNewUserByRegistr(body: CreateUserDto) {
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this._generateHash(body.password, passwordSalt);

    const newUser = {
      id: (Date.now() + Math.random()).toString(),
      login: body.login,
      email: body.email,
      passwordHash,
      passwordSalt,
      createdAt: new Date().toISOString(),
      emailConfirmation: {
        confirmationCode: uuidv4(),
        expirationDate: add(new Date(), {
          hours: 1,
          minutes: 0,
        }),
        isConfirmed: false,
      },
    };
    await this.usersRepository.createNewUser(newUser);

    await this.emailService.sendConfirmationEmail(
      newUser.email,
      newUser.emailConfirmation.confirmationCode,
    );

    return newUser.emailConfirmation.confirmationCode;
  }
  async confirmEmail(code: object) {
    const user = await this.usersRepository.findUserByCode(code);
    if (!user)
      throw new HttpException(
        [{ message: 'Invalid code', field: 'code' }],
        400,
      );
    if (user.emailConfirmation.isConfirmed)
      throw new HttpException(
        [{ message: 'Invalid code', field: 'code' }],
        400,
      );
    if (user.emailConfirmation.expirationDate < new Date())
      throw new HttpException(
        [{ message: 'Code expired', field: 'code' }],
        400,
      );
    const result = await this.usersRepository.updateConfirmation(user.id);
    return result;
  }
  async checkEmailForResendingRegistrCode(email: string) {
    const user = await this.usersRepository.findEmailUserForResendCode(email);
    if (!user)
      throw new HttpException(
        [{ message: 'Code expired', field: 'email' }],
        400,
      );
    if (user.emailConfirmation.isConfirmed)
      throw new HttpException(
        [{ message: 'Code expired', field: 'email' }],
        400,
      );
    const newCode = uuidv4();
    const updateCodeUser = await this.usersRepository.updateUserCodeForResend(
      user.id,
      newCode,
    );
    if (!updateCodeUser) return false;

    try {
      await this.emailService.sendConfirmationEmail(email, newCode);
    } catch (err) {
      console.log(err);
    }
    return newCode;
  }
  async createAndSendCodeForNewPassword(email: string) {
    const user = await this.usersRepository.findEmailUserForResendCode(email);
    const newCode = uuidv4();
    if (user) {
      await this.emailService.sendEmailPasswordRecoveryMessage(email, newCode);
      await this.usersRepository.enterCodeForNewPassword(email, newCode);
      return;
    } else {
      throw new HttpException(
        [{ message: 'Code expired', field: 'email' }],
        400,
      );
    }
  }
  async findUserByCodeForNewPassword(code: string) {
    const user = await this.usersRepository.findUserByCodeForNewPassword(code);
    if (!user)
      throw new HttpException(
        [{ message: 'Code expired', field: 'code' }],
        400,
      );
    return user;
  }
  async changePassword(userId: string, password: string) {
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this._generateHash(password, passwordSalt);

    const result = await this.usersRepository.changePassword(
      userId,
      passwordSalt,
      passwordHash,
    );
    if (result) return true;
    else
      throw new HttpException(
        [{ message: 'Code expired', field: 'code' }],
        400,
      );
  }
}
