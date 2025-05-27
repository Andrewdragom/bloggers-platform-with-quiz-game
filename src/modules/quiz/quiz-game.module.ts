import { Module } from '@nestjs/common';
import { QuizQuestionsController } from './api/quiz-questions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './domain/entities/question.entity';
import { CqrsModule } from '@nestjs/cqrs';
import { QuestionsRepositoryTypeOrm } from './infrastructure/questions.repositoryTypeOrm';
import { CreateQuestionUseCase } from './application/use-cases/question/create-question-use-case';
import { QuestionsService } from './application/questions.service';
import { QuestionsQueryRepositoryTypeOrm } from './infrastructure/questions.queryRepositoryTypeOrm';
import { DeleteQuestionUseCase } from './application/use-cases/question/delete-question-use-case';
import { UpdateQuestionUseCase } from './application/use-cases/question/update-question-use-case';
import { UpdateBlogUseCase } from './application/use-cases/question/publish-question-use-case';
import { Game } from './domain/entities/game.entity';
import { Answer } from './domain/entities/answer.entity';
import { QuizGameController } from './api/quiz-game.controller';
import { ConnectionGameUseCase } from './application/use-cases/game/connection-game-use-case';
import { GameQueryRepositoryTypeOrm } from './infrastructure/game.queryRepository';
import { GameRepositoryTypeOrm } from './infrastructure/game.repositoryTypeOrm';
import { UserAccountModule } from '../users-account/user-account.module';
import { GameQuestion } from './domain/entities/game-question.entity';
import { GameQuestionRepositoryTypeOrm } from './infrastructure/gameQuestion.repositoryTypeOrm';
import { AnswerGameUseCase } from './application/use-cases/game/answer-game-use-case';
import { GameQuestionQueryRepository } from './infrastructure/gameQuestion.queryRepository';
import { AnswersQueryRepo } from './infrastructure/answers.queryRepo';
import { AnswersRepo } from './infrastructure/answers.repo';
import { GameService } from './application/game.service';
import { Player } from './domain/entities/player.entity';
import { PlayerRepositoryTypeOrm } from './infrastructure/player.repositoryTypeOrm';
import { PlayerQueryRepositoryTypeOrm } from './infrastructure/player.queryRepo';
import { GameTimeoutService } from './application/game-timeout.service';
import { ScheduleModule } from '@nestjs/schedule';

const commandHandler = [
  CreateQuestionUseCase,
  DeleteQuestionUseCase,
  UpdateQuestionUseCase,
  UpdateBlogUseCase,
  ConnectionGameUseCase,
  AnswerGameUseCase,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([Question, Game, Answer, GameQuestion, Player]),
    CqrsModule,
    UserAccountModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [QuizQuestionsController, QuizGameController],
  providers: [
    QuestionsRepositoryTypeOrm,
    ...commandHandler,
    QuestionsService,
    QuestionsQueryRepositoryTypeOrm,
    GameQueryRepositoryTypeOrm,
    GameRepositoryTypeOrm,
    GameQuestionRepositoryTypeOrm,
    GameQuestionQueryRepository,
    AnswersQueryRepo,
    AnswersRepo,
    GameService,
    PlayerRepositoryTypeOrm,
    PlayerQueryRepositoryTypeOrm,
    GameTimeoutService,
  ],
})
export class QuizGameModule {}
