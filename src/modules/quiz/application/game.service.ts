import { HttpException, Inject, Injectable } from '@nestjs/common';
import { GameQueryRepositoryTypeOrm } from '../infrastructure/game.queryRepository';
import { UsersRepositoryTypeOrm } from '../../users-account/infrastructure/users.repositoryTypeOrm';
import { QuestionsQueryRepositoryTypeOrm } from '../infrastructure/questions.queryRepositoryTypeOrm';
import { AnswersQueryRepo } from '../infrastructure/answers.queryRepo';
import { isUUID } from 'class-validator';

@Injectable()
export class GameService {
  constructor(
    @Inject(GameQueryRepositoryTypeOrm)
    protected gameQueryRepositoryTypeOrm: GameQueryRepositoryTypeOrm,
    @Inject(UsersRepositoryTypeOrm)
    protected usersRepoTypeOrm: UsersRepositoryTypeOrm,
    @Inject(QuestionsQueryRepositoryTypeOrm)
    protected questionsQueryRepositoryTypeOrm: QuestionsQueryRepositoryTypeOrm,
    @Inject(AnswersQueryRepo)
    protected answersQueryRepository: AnswersQueryRepo,
  ) {}
  async getCurrentGame(userId: string) {
    const currentGameForUser =
      await this.gameQueryRepositoryTypeOrm.findCurrentGame(userId);
    if (!currentGameForUser) {
      throw new HttpException('', 404);
    }
    if (currentGameForUser.pending === 'PendingSecondPlayer') {
      const user = await this.usersRepoTypeOrm.findUserByID(userId);

      return {
        id: currentGameForUser.id,
        firstPlayerProgress: {
          answers: [], // или пустой массив потом посмотрим
          player: {
            id: currentGameForUser.firstPlayerId,
            login: user!.login,
          },
          score: currentGameForUser.scoreFirstPlayer,
        },
        secondPlayerProgress: null,
        questions: null,
        status: 'PendingSecondPlayer',
        pairCreatedDate: currentGameForUser.pairCreatedDate,
        startGameDate: null,
        finishGameDate: null,
      };
    } else if (currentGameForUser.pending === 'Active') {
      const player1 = await this.usersRepoTypeOrm.findUserByID(
        currentGameForUser.firstPlayerId,
      );
      const player2 = await this.usersRepoTypeOrm.findUserByID(
        currentGameForUser.secondPlayerId
          ? currentGameForUser.secondPlayerId
          : undefined,
      );
      //запрос за вопросами
      const questions =
        await this.questionsQueryRepositoryTypeOrm.getQuestionByGameId(
          currentGameForUser.id,
        );
      //ответы первого плеера
      const answersFirstPlayer =
        await this.answersQueryRepository.findAnswerForCurrentGame(
          currentGameForUser.id,
          player1!.id,
        );
      const answersSecondPlayer =
        await this.answersQueryRepository.findAnswerForCurrentGame(
          currentGameForUser.id,
          player2!.id,
        );
      return {
        id: currentGameForUser.id,
        firstPlayerProgress: {
          answers: answersFirstPlayer.length > 0 ? answersFirstPlayer : [],
          player: {
            id: player1!.id,
            login: player1!.login,
          },
          score: currentGameForUser.scoreFirstPlayer,
        },
        secondPlayerProgress: {
          answers: answersSecondPlayer ? answersSecondPlayer : [],
          player: {
            id: player2!.id,
            login: player2!.login,
          },
          score: currentGameForUser.scoreSecondPlayer,
        },
        questions: questions,
        status: 'Active',
        pairCreatedDate: currentGameForUser.pairCreatedDate,
        startGameDate: currentGameForUser.startGameDate,
        finishGameDate: null,
      };
    }
    return currentGameForUser;
  }
  async getGameByGameId(userId: string, gameId: string) {
    if (!isUUID(gameId) || gameId === null) {
      throw new HttpException('', 400);
    }

    const game = await this.gameQueryRepositoryTypeOrm.findGameByGameId(gameId);
    if (!game) {
      throw new HttpException('', 404);
    }
    const currentGameForUser =
      await this.gameQueryRepositoryTypeOrm.findCurrentGameForFindAboutGameId(
        userId,
        gameId,
      );
    if (!currentGameForUser) {
      throw new HttpException('', 403);
    }
    if (currentGameForUser.pending === 'PendingSecondPlayer') {
      const user = await this.usersRepoTypeOrm.findUserByID(userId);

      return {
        id: currentGameForUser.id,
        firstPlayerProgress: {
          answers: [], // или пустой массив потом посмотрим
          player: {
            id: currentGameForUser.firstPlayerId,
            login: user!.login,
          },
          score: currentGameForUser.scoreFirstPlayer,
        },
        secondPlayerProgress: null,
        questions: null,
        status: 'PendingSecondPlayer',
        pairCreatedDate: currentGameForUser.pairCreatedDate,
        startGameDate: null,
        finishGameDate: null,
      };
    } else if (
      currentGameForUser.pending === 'Active' ||
      currentGameForUser.pending === 'Finished'
    ) {
      const player1 = await this.usersRepoTypeOrm.findUserByID(
        currentGameForUser.firstPlayerId,
      );
      const player2 = await this.usersRepoTypeOrm.findUserByID(
        currentGameForUser.secondPlayerId
          ? currentGameForUser.secondPlayerId
          : undefined,
      );
      //запрос за вопросами
      const questions =
        await this.questionsQueryRepositoryTypeOrm.getQuestionByGameId(
          currentGameForUser.id,
        );
      //ответы первого плеера
      const answersFirstPlayer =
        await this.answersQueryRepository.findAnswerForCurrentGame(
          currentGameForUser.id,
          player1!.id,
        );
      const answersSecondPlayer =
        await this.answersQueryRepository.findAnswerForCurrentGame(
          currentGameForUser.id,
          player2!.id,
        );
      return {
        id: currentGameForUser.id,
        firstPlayerProgress: {
          answers: answersFirstPlayer.length > 0 ? answersFirstPlayer : [],
          player: {
            id: player1!.id,
            login: player1!.login,
          },
          score: currentGameForUser.scoreFirstPlayer,
        },
        secondPlayerProgress: {
          answers: answersSecondPlayer ? answersSecondPlayer : [],
          player: {
            id: player2!.id,
            login: player2!.login,
          },
          score: currentGameForUser.scoreSecondPlayer,
        },
        questions: questions,
        status: currentGameForUser.pending,
        pairCreatedDate: currentGameForUser.pairCreatedDate,
        startGameDate: currentGameForUser.startGameDate,
        finishGameDate: currentGameForUser.finishGameDate,
      };
    }
    return currentGameForUser;
  }
  async getAllGamesForUser(
    userId: string,
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
  ) {
    const findGames = await this.gameQueryRepositoryTypeOrm.findAllGamesForUser(
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      userId,
    );

    const mapFindGamesForView = await Promise.all(
      findGames.map(async (game) => {
        const player1 = await this.usersRepoTypeOrm.findUserByID(
          game.firstPlayerId,
        );
        const player2 = await this.usersRepoTypeOrm.findUserByID(
          game.secondPlayerId ? game.secondPlayerId : undefined,
        );
        //запрос за вопросами
        const questions =
          await this.questionsQueryRepositoryTypeOrm.getQuestionByGameId(
            game.id,
          );
        //ответы первого плеера
        const answersFirstPlayer =
          await this.answersQueryRepository.findAnswerForCurrentGame(
            game.id,
            player1!.id,
          );
        const answersSecondPlayer =
          await this.answersQueryRepository.findAnswerForCurrentGame(
            game.id,
            player2!.id,
          );

        return {
          id: game.id,
          firstPlayerProgress: {
            answers: answersFirstPlayer.length > 0 ? answersFirstPlayer : [],
            player: {
              id: player1!.id,
              login: player1!.login,
            },
            score: game.scoreFirstPlayer,
          },
          secondPlayerProgress: {
            answers: answersSecondPlayer ? answersSecondPlayer : [],
            player: {
              id: player2!.id,
              login: player2!.login,
            },
            score: game.scoreSecondPlayer,
          },
          questions: questions,
          status: game.pending,
          pairCreatedDate: game.pairCreatedDate,
          startGameDate: game.startGameDate,
          finishGameDate: game.finishGameDate,
        };
      }),
    );

    const countGames =
      await this.gameQueryRepositoryTypeOrm.getGamesCount(userId);
    return {
      pagesCount: Math.ceil(countGames / pageSize),
      page: pageNumber,
      pageSize,
      totalCount: countGames,
      items: mapFindGamesForView,
    };
  }
}
