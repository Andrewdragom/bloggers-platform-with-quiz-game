import { Inject } from '@nestjs/common';
import { UsersService } from '../users.service';
import { CreateUserDto } from '../../dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepositoryPostgres } from '../../infrastructure/users.repositoryPostgres';
import { User } from '../../domain/entities/user.entity';
import { UsersRepositoryTypeOrm } from '../../infrastructure/users.repositoryTypeOrm';

export class CreateUserCommand {
  constructor(public body: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject(UsersService) protected usersService: UsersService,
    @Inject(UsersRepositoryPostgres)
    protected usersRepositoryPostgres: UsersRepositoryPostgres,
    @Inject(UsersRepositoryTypeOrm)
    protected usersRepositoryTypeOrm: UsersRepositoryTypeOrm,
  ) {}
  async execute(command: CreateUserCommand) {
    if (!command.body.login || !command.body.password || !command.body.email) {
      throw new Error('invalid date');
    }

    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this.usersService._generateHash(
      command.body.password,
      passwordSalt,
    );

    const newUser = User.createInstance(
      command.body,
      passwordHash,
      passwordSalt,
    );

    await this.usersRepositoryTypeOrm.createNewUser(newUser);

    return {
      id: newUser.id,
      login: newUser.login,
      email: newUser.email,
      createdAt: newUser.createdAt,
    };
  }
}
