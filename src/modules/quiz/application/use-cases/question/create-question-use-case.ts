import { CreateQuestionDto } from '../../../api/input-dto/create-question.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { QuestionAfterCreateViewDto } from '../../../api/view-dto/question-after-create-view.dto';
import { Question } from '../../../domain/entities/question.entity';
import { QuestionsRepositoryTypeOrm } from '../../../infrastructure/questions.repositoryTypeOrm';

export class CreateQuestionCommand {
  constructor(public body: CreateQuestionDto) {}
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionUseCase
  implements ICommandHandler<CreateQuestionCommand>
{
  constructor(
    @Inject(QuestionsRepositoryTypeOrm)
    protected questionRepository: QuestionsRepositoryTypeOrm,
  ) {}
  async execute(
    command: CreateQuestionCommand,
  ): Promise<QuestionAfterCreateViewDto> {
    const newQuestion = Question.createInstanceQuestion(command.body);
    await this.questionRepository.saveQuestion(newQuestion);
    return {
      id: newQuestion.id,
      body: newQuestion.body,
      correctAnswers: newQuestion.correctAnswers,
      published: newQuestion.published,
      createdAt: newQuestion.createdAt,
      updatedAt: newQuestion.updatedAt,
    };
  }
}
