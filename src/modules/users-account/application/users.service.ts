import {
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../dto/create-user.dto';
import { EmailService } from '../../notifications/email.service';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';
import { UsersRepositoryPostgres } from '../infrastructure/users.repositoryPostgres';

import { UsersRepositoryTypeOrm } from '../infrastructure/users.repositoryTypeOrm';
import { UsersQueryRepoTypeOrm } from '../infrastructure/users.queryRepoTypeOrm';
import { PaginatedUsersResponse } from '../types/paginated-userResponse.types';

@Injectable()
export class UsersService {
  constructor(
    @Inject(EmailService) protected emailService: EmailService,
    @Inject(UsersRepositoryPostgres)
    protected usersRepositoryPostgres: UsersRepositoryPostgres,
    @Inject(UsersRepositoryTypeOrm)
    protected usersRepositoryTypeOrm: UsersRepositoryTypeOrm,
    @Inject(UsersQueryRepoTypeOrm)
    protected usersQueryRepoTypeOrm: UsersQueryRepoTypeOrm,
  ) {}
  async findUsers(
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    searchLoginTerm: string,
    searchEmailTerm: string,
  ): Promise<PaginatedUsersResponse> {
    const allUsers = await this.usersQueryRepoTypeOrm.findUsers(
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
    const usersCount = await this.usersQueryRepoTypeOrm.getUsersCount(
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
    const checkLogin =
      await this.usersRepositoryTypeOrm.findByLoginOrEmail(login);
    if (checkLogin) {
      throw new HttpException(
        [{ message: 'login should be unique', field: 'login' }],
        400,
      );
    }
    return checkLogin;
  }
  async checkEmail(email: string) {
    const checkEmail =
      await this.usersRepositoryTypeOrm.findByLoginOrEmail(email);
    if (checkEmail) {
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
  async checkCredentials(loginOrEmail: string, password: string) {
    const user =
      await this.usersRepositoryTypeOrm.findByLoginOrEmail(loginOrEmail);
    if (!user) return false;
    const passwordHash = await this._generateHash(password, user.passwordSalt);
    if (user.passwordHash != passwordHash) {
      return false;
    }
    return user;
  }
  async findUserById(id: string | undefined) {
    const foundUser = await this.usersRepositoryTypeOrm.findUserByID(id);
    if (!foundUser) throw new NotFoundException(`User with ID ${id} not found`);
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
      id: uuidv4(),
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
    await this.usersRepositoryTypeOrm.createNewUser(newUser);

    await this.emailService.sendConfirmationEmail(
      newUser.email,
      newUser.emailConfirmation.confirmationCode,
    );

    return newUser.emailConfirmation.confirmationCode;
  }
  async confirmEmail(code: object) {
    const user = await this.usersRepositoryTypeOrm.findUserByCode(code);
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
    const result = await this.usersRepositoryTypeOrm.updateConfirmation(
      user.id,
    );
    return result;
  }
  async checkEmailForResendingRegistrCode(email: string) {
    const user =
      await this.usersRepositoryTypeOrm.findEmailUserForResendCode(email);
    if (!user)
      throw new HttpException(
        [{ message: 'Code expired', field: 'email' }],
        400,
      );
    if (user.emailConfirmation?.isConfirmed)
      throw new HttpException(
        [{ message: 'Code expired', field: 'email' }],
        400,
      );
    const newCode = uuidv4();
    const updateCodeUser =
      await this.usersRepositoryTypeOrm.updateUserCodeForResend(
        user.id,
        newCode,
      );
    // if (!updateCodeUser) return false;

    try {
      await this.emailService.sendConfirmationEmail(email, newCode);
    } catch (err) {
      console.log(err);
    }
    return newCode;
  }
  async createAndSendCodeForNewPassword(email: string) {
    const user =
      await this.usersRepositoryTypeOrm.findEmailUserForResendCode(email);
    const newCode = uuidv4();
    if (user) {
      await this.emailService.sendEmailPasswordRecoveryMessage(email, newCode);
      await this.usersRepositoryTypeOrm.enterCodeForNewPassword(email, newCode);
      return;
    } else {
      throw new HttpException(
        [{ message: 'Code expired', field: 'email' }],
        400,
      );
    }
  }
  async findUserByCodeForNewPassword(code: string) {
    const user =
      await this.usersRepositoryTypeOrm.findUserByCodeForNewPassword(code);
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
    const result = await this.usersRepositoryTypeOrm.changePassword(
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
