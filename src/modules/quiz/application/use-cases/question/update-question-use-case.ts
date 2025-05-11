import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { QuestionAfterCreateViewDto } from '../../../api/view-dto/question-after-create-view.dto';
import { QuestionsRepositoryTypeOrm } from '../../../infrastructure/questions.repositoryTypeOrm';
import { QuestionsQueryRepositoryTypeOrm } from '../../../infrastructure/questions.queryRepositoryTypeOrm';
import { UpdateQuestionDto } from '../../../api/input-dto/update-question.dto';

export class UpdateQuestionCommand {
  constructor(
    public body: UpdateQuestionDto,
    public id: string,
  ) {}
}

@CommandHandler(UpdateQuestionCommand)
export class UpdateQuestionUseCase
  implements ICommandHandler<UpdateQuestionCommand>
{
  constructor(
    @Inject(QuestionsRepositoryTypeOrm)
    protected questionRepository: QuestionsRepositoryTypeOrm,
    @Inject(QuestionsQueryRepositoryTypeOrm)
    protected questionsQueryRepositoryTypeOrm: QuestionsQueryRepositoryTypeOrm,
  ) {}
  async execute(
    command: UpdateQuestionCommand,
  ): Promise<QuestionAfterCreateViewDto> {
    const getQuestion =
      await this.questionsQueryRepositoryTypeOrm.findQuestionById(command.id);
    if (!getQuestion) {
      throw new NotFoundException(`Blog with ID ${command.id} not found`);
    }
    getQuestion.updateQuestion(command.body);
    await this.questionRepository.saveQuestion(getQuestion);
    return {
      id: getQuestion.id,
      body: getQuestion.body,
      correctAnswers: getQuestion.correctAnswers,
      published: getQuestion.published,
      createdAt: getQuestion.createdAt,
      updatedAt: getQuestion.updatedAt,
    };
  }
}
