import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetUsersQueryDto } from './input-dto/get-users-query-params';
import { UsersService } from '../application/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { AuthGuardBasicAuth } from '../guards/basic/basic-auth.guard';
import { CoreConfig } from '../../../core/core.config';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../application/use-cases/create-user-use-case';
import { DeleteUserCommand } from '../application/use-cases/delete-user-use-case';
import { PaginatedUsersResponse } from '../types/paginated-userResponse.types';

@Controller('sa/users')
export class UsersController {
  constructor(
    @Inject(UsersService) protected usersService: UsersService,
    @Inject(CoreConfig) protected coreConfig: CoreConfig,
    @Inject(CommandBus) protected commandBus: CommandBus,
  ) {}
  @UseGuards(AuthGuardBasicAuth)
  @Get()
  async getAllUsers(
    @Query() query: GetUsersQueryDto,
  ): Promise<PaginatedUsersResponse> {
    return this.usersService.findUsers(
      query.pageNumber,
      query.pageSize,
      query.sortBy,
      query.sortDirection,
      query.searchLoginTerm,
      query.searchEmailTerm,
    );
  }
  @UseGuards(AuthGuardBasicAuth)
  @Post()
  async createUser(@Body() body: CreateUserDto) {
    await this.usersService.checkLogin(body.login);
    await this.usersService.checkEmail(body.email);

    return this.commandBus.execute(new CreateUserCommand(body));
  }
  @UseGuards(AuthGuardBasicAuth)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string) {
    return this.commandBus.execute(new DeleteUserCommand(id));
  }
}
