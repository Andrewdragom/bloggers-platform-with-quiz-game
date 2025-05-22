import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, Inject } from '@nestjs/common';
import { QuestionsQueryRepositoryTypeOrm } from '../../../infrastructure/questions.queryRepositoryTypeOrm';
import { GameQueryRepositoryTypeOrm } from '../../../infrastructure/game.queryRepository';
import { GameRepositoryTypeOrm } from '../../../infrastructure/game.repositoryTypeOrm';
import { UsersRepositoryTypeOrm } from '../../../../users-account/infrastructure/users.repositoryTypeOrm';
import { GameQuestionRepositoryTypeOrm } from '../../../infrastructure/gameQuestion.repositoryTypeOrm';
import { GameQuestionQueryRepository } from '../../../infrastructure/gameQuestion.queryRepository';
import { AnswersQueryRepo } from '../../../infrastructure/answers.queryRepo';
import { Answer } from '../../../domain/entities/answer.entity';
import { AnswersRepo } from '../../../infrastructure/answers.repo';
import { PlayerQueryRepositoryTypeOrm } from '../../../infrastructure/player.queryRepo';
import { PlayerRepositoryTypeOrm } from '../../../infrastructure/player.repositoryTypeOrm';

export class AnswerGameCommand {
  constructor(
    public userId: any,
    public answer: string,
  ) {}
}

@CommandHandler(AnswerGameCommand)
export class AnswerGameUseCase implements ICommandHandler<AnswerGameCommand> {
  constructor(
    @Inject(QuestionsQueryRepositoryTypeOrm)
    protected questionsQueryRepositoryTypeOrm: QuestionsQueryRepositoryTypeOrm,
    @Inject(GameQueryRepositoryTypeOrm)
    protected gameQueryRepositoryTypeOrm: GameQueryRepositoryTypeOrm,
    @Inject(GameRepositoryTypeOrm)
    protected gameRepositoryTypeOrm: GameRepositoryTypeOrm,
    @Inject(UsersRepositoryTypeOrm)
    protected usersRepoTypeOrm: UsersRepositoryTypeOrm,
    @Inject(GameQuestionRepositoryTypeOrm)
    protected gameQuestionRepositoryTypeOrm: GameQuestionRepositoryTypeOrm,
    @Inject(GameQuestionQueryRepository)
    protected gameQuestionQueryRepository: GameQuestionQueryRepository,
    @Inject(AnswersQueryRepo)
    protected answersQueryRepository: AnswersQueryRepo,
    @Inject(AnswersRepo) protected answersRepo: AnswersRepo,
    @Inject(PlayerQueryRepositoryTypeOrm)
    protected playerQueryRepositoryTypeOrm: PlayerQueryRepositoryTypeOrm,
    @Inject(PlayerRepositoryTypeOrm)
    protected playerRepositoryTypeOrm: PlayerRepositoryTypeOrm,
  ) {}

  async execute(command: AnswerGameCommand): Promise<any> {
    let index;
    //ищем игру
    const currentGameForUser =
      await this.gameQueryRepositoryTypeOrm.findActiveCurrentGame(
        command.userId,
      );

    if (!currentGameForUser) {
      throw new HttpException('', 403);
    }

    const howMuchAnswerHave =
      await this.answersQueryRepository.findAnswerByGameIdAndUserId(
        currentGameForUser.id,
        command.userId,
      );

    index = howMuchAnswerHave.length + 1;
    if (index === 6) {
      throw new HttpException('', 403);
    }

    const currentQuestionId =
      await this.gameQuestionQueryRepository.findCurrentQuestion(
        currentGameForUser.id,
        index,
      );

    const currentQuestion =
      await this.questionsQueryRepositoryTypeOrm.findQuestionById(
        currentQuestionId?.questionId,
      );

    //проверка ответа и если ответ правильный------------------------------------
    if (currentQuestion?.correctAnswers.includes(command.answer.trim())) {
      const answer = Answer.createInstanceAnswer(
        command.answer,
        currentGameForUser.id,
        command.userId,
        currentQuestion?.id,
        true,
      );
      await this.answersRepo.saveAnswer(answer);
      await this.gameRepositoryTypeOrm.addScore(
        currentGameForUser.id,
        command.userId,
      );
      if (index === 5 && !currentGameForUser.bonusScore) {
        await this.gameRepositoryTypeOrm.changeBonusScore(
          currentGameForUser.id,
        );
        if (command.userId === currentGameForUser.firstPlayerId) {
          await this.gameRepositoryTypeOrm.changeBonusScoreFirst(
            currentGameForUser.id,
          );
        } else if (command.userId === currentGameForUser.secondPlayerId) {
          await this.gameRepositoryTypeOrm.changeBonusScoreSecond(
            currentGameForUser.id,
          );
        }
        index = index + 1;
      }
      if (index === 5) {
        index = index + 1;
      }

      const tenAnswersForFinishGame =
        await this.answersQueryRepository.findAnswersForFinishGame(
          currentGameForUser.id,
        );
      if (tenAnswersForFinishGame.length === 10) {
        const getGameForFiniched =
          await this.gameQueryRepositoryTypeOrm.findActiveCurrentGame(
            command.userId,
          );
        //проверка кому дать бонусное очко-----------------------------------
        if (
          getGameForFiniched?.bonusScoreFirst &&
          getGameForFiniched.scoreFirstPlayer != 0
        ) {
          getGameForFiniched.scoreFirstPlayer =
            getGameForFiniched.scoreFirstPlayer + 1;
        } else if (
          getGameForFiniched?.bonusScoreSecond &&
          getGameForFiniched.scoreSecondPlayer != 0
        ) {
          getGameForFiniched.scoreSecondPlayer =
            getGameForFiniched.scoreSecondPlayer + 1;
        }
        //подгружаем плееры для фиксации кол-ва побед ничей прогрышей суммы очков
        const player = await this.playerQueryRepositoryTypeOrm.findPlayer(
          getGameForFiniched!.firstPlayerId,
        );
        if (!player) throw new HttpException('', 403);
        if (!getGameForFiniched!.secondPlayerId)
          throw new HttpException('', 403);
        const player2 = await this.playerQueryRepositoryTypeOrm.findPlayer(
          getGameForFiniched!.secondPlayerId,
        );
        if (!player2) throw new HttpException('', 403);
        //проверка кто победил

        if (
          getGameForFiniched!.scoreFirstPlayer >
          getGameForFiniched!.scoreSecondPlayer
        ) {
          player.winsCount = player.winsCount + 1;
          player2.lossesCount = player2.lossesCount + 1;
        } else if (
          getGameForFiniched!.scoreFirstPlayer ===
          getGameForFiniched!.scoreSecondPlayer
        ) {
          player.drawsCount = player.drawsCount + 1;
          player2.drawsCount = player2.drawsCount + 1;
        } else if (
          getGameForFiniched!.scoreFirstPlayer <
          getGameForFiniched!.scoreSecondPlayer
        ) {
          player.lossesCount = player.lossesCount + 1;
          player2.winsCount = player2.winsCount + 1;
        }
        player.sumScore =
          player.sumScore + getGameForFiniched!.scoreFirstPlayer;
        player2.sumScore =
          player2.sumScore + getGameForFiniched!.scoreSecondPlayer;
        await this.playerRepositoryTypeOrm.savePlayer(player);
        await this.playerRepositoryTypeOrm.savePlayer(player2);
        // --------------------------------------------------------------
        getGameForFiniched!.finishGameDate = new Date();
        getGameForFiniched!.pending = 'Finished';
        await this.gameRepositoryTypeOrm.saveGame(getGameForFiniched);
      }
      return {
        questionId: answer.questionId,
        answerStatus: 'Correct',
        addedAt: answer.createdAt,
      };
      // если ответ неправильный----------------------------------------------------------------
    } else {
      const answer = Answer.createInstanceAnswer(
        command.answer,
        currentGameForUser.id,
        command.userId,
        currentQuestion?.id,
        false,
      );
      await this.answersRepo.saveAnswer(answer);

      if (index === 5 && !currentGameForUser.bonusScore) {
        await this.gameRepositoryTypeOrm.changeBonusScore(
          currentGameForUser.id,
        );
        if (command.userId === currentGameForUser.firstPlayerId) {
          await this.gameRepositoryTypeOrm.changeBonusScoreFirst(
            currentGameForUser.id,
          );
        } else if (command.userId === currentGameForUser.secondPlayerId) {
          await this.gameRepositoryTypeOrm.changeBonusScoreSecond(
            currentGameForUser.id,
          );
        }
        index = index + 1;
      }
      if (index === 5) {
        index = index + 1;
      }

      const tenAnswersForFinishGame =
        await this.answersQueryRepository.findAnswersForFinishGame(
          currentGameForUser.id,
        );
      if (tenAnswersForFinishGame.length === 10) {
        const getGameForFiniched =
          await this.gameQueryRepositoryTypeOrm.findActiveCurrentGame(
            command.userId,
          );
        //проверка кому дать бонусное очко-----------------------------------
        if (
          getGameForFiniched?.bonusScoreFirst &&
          getGameForFiniched.scoreFirstPlayer != 0
        ) {
          getGameForFiniched.scoreFirstPlayer =
            getGameForFiniched.scoreFirstPlayer + 1;
        } else if (
          getGameForFiniched?.bonusScoreSecond &&
          getGameForFiniched.scoreSecondPlayer != 0
        ) {
          getGameForFiniched.scoreSecondPlayer =
            getGameForFiniched.scoreSecondPlayer + 1;
        }
        // --------------------------------------------------------------
        // проверка кто победил
        //подгружаем плееры для фиксации кол-ва побед ничей прогрышей суммы очков
        const player = await this.playerQueryRepositoryTypeOrm.findPlayer(
          getGameForFiniched!.firstPlayerId,
        );
        if (!player) throw new HttpException('', 403);
        if (!getGameForFiniched!.secondPlayerId)
          throw new HttpException('', 403);
        const player2 = await this.playerQueryRepositoryTypeOrm.findPlayer(
          getGameForFiniched!.secondPlayerId,
        );
        if (!player2) throw new HttpException('', 403);
        //проверка кто победил

        if (
          getGameForFiniched!.scoreFirstPlayer >
          getGameForFiniched!.scoreSecondPlayer
        ) {
          player.winsCount = player.winsCount + 1;
          player2.lossesCount = player2.lossesCount + 1;
        } else if (
          getGameForFiniched!.scoreFirstPlayer ===
          getGameForFiniched!.scoreSecondPlayer
        ) {
          player.drawsCount = player.drawsCount + 1;
          player2.drawsCount = player2.drawsCount + 1;
        } else if (
          getGameForFiniched!.scoreFirstPlayer <
          getGameForFiniched!.scoreSecondPlayer
        ) {
          player.lossesCount = player.lossesCount + 1;
          player2.winsCount = player2.winsCount + 1;
        }
        player.sumScore =
          player.sumScore + getGameForFiniched!.scoreFirstPlayer;
        player2.sumScore =
          player2.sumScore + getGameForFiniched!.scoreSecondPlayer;
        await this.playerRepositoryTypeOrm.savePlayer(player);
        await this.playerRepositoryTypeOrm.savePlayer(player2);
        //----------------------------------------------------------------------------
        getGameForFiniched!.finishGameDate = new Date();
        getGameForFiniched!.pending = 'Finished';
        await this.gameRepositoryTypeOrm.saveGame(getGameForFiniched);
      }
      return {
        questionId: answer.questionId,
        answerStatus: 'Incorrect',
        addedAt: answer.createdAt,
      };
    }
  }
}
