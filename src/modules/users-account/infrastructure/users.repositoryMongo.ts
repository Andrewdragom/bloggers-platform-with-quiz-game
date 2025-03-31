import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from '../domain/users.schema';

@Injectable()
export class UsersRepositoryMongo {
  constructor(@InjectModel('users') private usersModel: Model<UserDocument>) {}
  async findUsers(
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    searchLoginTerm: any,
    searchEmailTerm: any,
  ) {
    if (!searchEmailTerm && !searchLoginTerm) {
      const allUsers = await this.usersModel
        .find({})
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 });
      return allUsers;
    }

    const filter: any = {};

    if (searchLoginTerm) {
      filter.login = { $regex: searchLoginTerm, $options: 'i' };
    }
    if (searchEmailTerm) {
      filter.email = { $regex: searchEmailTerm, $options: 'i' };
    }

    const allUsers = await this.usersModel
      .find({ $or: [{ email: filter.email }, { login: filter.login }] })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 });
    return allUsers;
  }
  async getUsersCount(searchLoginTerm: any, searchEmailTerm: any) {
    if (!searchEmailTerm && !searchLoginTerm) {
      return this.usersModel.countDocuments({});
    }
    const filter: any = {};
    if (searchLoginTerm) {
      filter.login = { $regex: searchLoginTerm, $options: 'i' };
    }
    if (searchEmailTerm) {
      filter.email = { $regex: searchEmailTerm, $options: 'i' };
    }
    return this.usersModel.countDocuments({
      $or: [{ email: filter.email }, { login: filter.login }],
    });
  }
  async findLoginUserForCheck(loginUser: string) {
    const result = await this.usersModel.find({ login: loginUser });
    return result;
  }
  async findEmailUserForCheck(email: string) {
    const result = await this.usersModel.find({ email: email });
    return result;
  }
  async createNewUser(newUser: object) {
    const result = await this.usersModel.create({ ...newUser });
    return result;
  }
  async deleteUserByID(id: string | null) {
    const result = await this.usersModel.deleteOne({ id: id });
    if (result.deletedCount === 1) {
      return true;
    } else {
      return false;
    }
  }
  async findByLoginOrEmail(loginOrEmail: string) {
    const user = await this.usersModel.findOne({
      $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
    });
    return user;
  }
  async findUserByID(id: string | null) {
    const findUser = await this.usersModel.findOne({ id: id });
    return findUser;
  }
  async findUserByCode(code: object) {
    const findUser = await this.usersModel.findOne({
      'emailConfirmation.confirmationCode': code,
    });
    return findUser;
  }
  async updateConfirmation(id: string | null) {
    const result = await this.usersModel.updateOne(
      { id },
      { $set: { 'emailConfirmation.isConfirmed': true } },
    );
    return result.modifiedCount === 1;
  }
  async findEmailUserForResendCode(email: string) {
    const result = await this.usersModel.findOne({ email: email });
    return result;
  }
  async updateUserCodeForResend(id: string, code: string | null) {
    const result = await this.usersModel.updateOne(
      { id },
      { $set: { 'emailConfirmation.confirmationCode': code } },
    );
    return result.modifiedCount === 1;
  }
  async enterCodeForNewPassword(email: string, code: string | null) {
    const result = await this.usersModel.updateOne(
      { email },
      { $set: { 'newPassword.confirmationCode': code } },
    );
    return result.modifiedCount === 1;
  }
  async findUserByCodeForNewPassword(code: string | null) {
    if (!code) {
      throw new HttpException(
        [{ message: 'Code expired', field: 'code' }],
        400,
      );
    }
    const findUser = await this.usersModel.findOne({
      'newPassword.confirmationCode': code,
    });
    return findUser;
  }
  async changePassword(
    userId: string,
    passwordSalt: string,
    passwordHash: string,
  ) {
    const result = await this.usersModel.updateOne(
      { id: userId },
      { $set: { passwordSalt: passwordSalt, passwordHash: passwordHash } },
    );
    return result;
  }
}
