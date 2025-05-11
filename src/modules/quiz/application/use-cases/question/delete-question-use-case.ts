import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { QuestionsRepositoryTypeOrm } from '../../../infrastructure/questions.repositoryTypeOrm';

export class DeleteQuestionCommand {
  constructor(public id: string | null) {}
}

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionUseCase
  implements ICommandHandler<DeleteQuestionCommand>
{
  constructor(
    @Inject(QuestionsRepositoryTypeOrm)
    protected questionRepositoryTypeOrm: QuestionsRepositoryTypeOrm,
  ) {}
  async execute(command: DeleteQuestionCommand): Promise<boolean> {
    const result = await this.questionRepositoryTypeOrm.deleteQuestionById(
      command.id,
    );
    if (!result.affected) {
      throw new NotFoundException(`Blog with ID ${command.id} not found`);
    }
    return true;
  }
}
