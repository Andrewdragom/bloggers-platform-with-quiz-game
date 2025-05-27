import { Inject, Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { GameRepositoryTypeOrm } from '../infrastructure/game.repositoryTypeOrm';
import { GameQueryRepositoryTypeOrm } from '../infrastructure/game.queryRepository';
import { AnswersRepo } from '../infrastructure/answers.repo';
import { GameQuestionQueryRepository } from '../infrastructure/gameQuestion.queryRepository';
import { AnswersQueryRepo } from '../infrastructure/answers.queryRepo';
import { Answer } from '../domain/entities/answer.entity';

@Injectable()
export class GameTimeoutService {
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private gameRepository: GameRepositoryTypeOrm,
    private gameQueryRepository: GameQueryRepositoryTypeOrm,
    private answersRepo: AnswersRepo,
    private gameQuestionQueryRepo: GameQuestionQueryRepository,
    @Inject(AnswersQueryRepo)
    protected answersQueryRepository: AnswersQueryRepo,
  ) {}

  scheduleFinishTimeout(gameId: string, waitingUserId: string) {
    const timeoutName = `finish-${gameId}`;

    if (this.schedulerRegistry.doesExist('timeout', timeoutName)) {
      this.schedulerRegistry.deleteTimeout(timeoutName); // на всякий случай
    }

    const timeout = setTimeout(async () => {
      await this.forceFinishGame(gameId, waitingUserId);
      this.schedulerRegistry.deleteTimeout(timeoutName);
    }, 10_000);

    this.schedulerRegistry.addTimeout(timeoutName, timeout);
  }

  private async forceFinishGame(gameId: string, userId: string) {
    const existingAnswers =
      await this.answersQueryRepository.findAnswerByGameIdAndUserId(
        gameId,
        userId,
      );
    const currentGame = await this.gameQueryRepository.findGameByGameId(gameId);

    if (!currentGame || existingAnswers.length >= 5) return;

    for (let i = existingAnswers.length + 1; i <= 5; i++) {
      const question = await this.gameQuestionQueryRepo.findCurrentQuestion(
        gameId,
        i,
      );
      const answer = Answer.createInstanceAnswer(
        '',
        gameId,
        userId,
        question?.questionId,
        false,
      );
      await this.answersRepo.saveAnswer(answer);
    }

    const totalAnswers =
      await this.answersQueryRepository.findAnswersForFinishGame(gameId);
    if (totalAnswers.length === 10) {
      if (userId === currentGame.firstPlayerId) {
        currentGame.scoreSecondPlayer += 1;
      } else if (userId === currentGame.secondPlayerId) {
        currentGame.scoreFirstPlayer += 1;
      }
      currentGame.finishGameDate = new Date();
      currentGame.pending = 'Finished';
      await this.gameRepository.saveGame(currentGame);
    }
  }
}
