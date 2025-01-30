import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetUsersQueryParams } from './dto/get-users-query-params';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuardBasicAuth } from '../guards/basic/basic-auth.guard';

@Controller('users')
export class UsersController {
  constructor(@Inject(UsersService) protected usersService: UsersService) {}
  @UseGuards(AuthGuardBasicAuth)
  @Get()
  async getAllUsers(@Query() query: GetUsersQueryParams) {
    const pageNumber = query.pageNumber ? +query.pageNumber : 1;
    const pageSize = query.pageSize ? +query.pageSize : 10;
    const sortBy = query.sortBy ? query.sortBy.toString() : 'createdAt';
    const sortDirection =
      query.sortDirection && query.sortDirection.toString() === 'asc'
        ? 'asc'
        : 'desc';

    const searchLoginTerm = query.searchLoginTerm
      ? query.searchLoginTerm
      : null;
    const searchEmailTerm = query.searchEmailTerm
      ? query.searchEmailTerm
      : null;

    const allUsers = await this.usersService.findUsers(
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      searchLoginTerm,
      searchEmailTerm,
    );

    return allUsers;
  }
  @UseGuards(AuthGuardBasicAuth)
  @Post()
  async createUser(@Body() body: CreateUserDto) {
    await this.usersService.checkLogin(body.login);
    await this.usersService.checkEmail(body.email);

    const newUser: object | boolean | null =
      await this.usersService.createNewUser(body);

    return newUser;
  }
  @UseGuards(AuthGuardBasicAuth)
  @Delete(':id')
  @HttpCode(204)
  async deletePost(@Param('id') id: string) {
    return this.usersService.deleteUserById(id);
  }
}
