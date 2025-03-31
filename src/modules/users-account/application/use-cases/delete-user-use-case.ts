import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UsersRepositoryPostgres } from '../../infrastructure/users.repositoryPostgres';
import { UsersRepositoryTypeOrm } from '../../infrastructure/users.repositoryTypeOrm';

export class DeleteUserCommand {
  constructor(public id: string | null) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(
    @Inject(UsersRepositoryPostgres)
    protected usersRepositoryPostgres: UsersRepositoryPostgres,
    @Inject(UsersRepositoryTypeOrm)
    protected usersRepositoryTypeOrm: UsersRepositoryTypeOrm,
  ) {}
  async execute(command: DeleteUserCommand) {
    const result = await this.usersRepositoryTypeOrm.deleteUserByID(command.id);
    if (!result) {
      throw new NotFoundException(`User with ID ${command.id} not found`);
    }
    return result;
  }
}
