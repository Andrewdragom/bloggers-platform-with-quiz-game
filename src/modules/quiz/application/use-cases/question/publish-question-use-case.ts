import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, Inject, NotFoundException } from '@nestjs/common';
import { QuestionsRepositoryTypeOrm } from '../../../infrastructure/questions.repositoryTypeOrm';
import { QuestionsQueryRepositoryTypeOrm } from '../../../infrastructure/questions.queryRepositoryTypeOrm';
import { PublishQuestionDto } from '../../../api/input-dto/publish-question.dto';

export class PublishQuestionCommand {
  constructor(
    public body: PublishQuestionDto,
    public id: string,
  ) {}
}

@CommandHandler(PublishQuestionCommand)
export class UpdateBlogUseCase
  implements ICommandHandler<PublishQuestionCommand>
{
  constructor(
    @Inject(QuestionsRepositoryTypeOrm)
    protected questionRepository: QuestionsRepositoryTypeOrm,
    @Inject(QuestionsQueryRepositoryTypeOrm)
    protected questionsQueryRepositoryTypeOrm: QuestionsQueryRepositoryTypeOrm,
  ) {}
  async execute(command: PublishQuestionCommand): Promise<boolean> {
    const getQuestion =
      await this.questionsQueryRepositoryTypeOrm.findQuestionById(command.id);
    if (!getQuestion) {
      throw new NotFoundException(`Blog with ID ${command.id} not found`);
    }
    getQuestion.publishQuestion(command.body);
    await this.questionRepository.saveQuestion(getQuestion);
    return true;
  }
}
