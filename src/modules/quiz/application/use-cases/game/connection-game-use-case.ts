import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, Inject } from '@nestjs/common';
import { QuestionsQueryRepositoryTypeOrm } from '../../../infrastructure/questions.queryRepositoryTypeOrm';
import { GameQueryRepositoryTypeOrm } from '../../../infrastructure/game.queryRepository';
import { Game } from '../../../domain/entities/game.entity';
import { GameRepositoryTypeOrm } from '../../../infrastructure/game.repositoryTypeOrm';
import { UsersRepositoryTypeOrm } from '../../../../users-account/infrastructure/users.repositoryTypeOrm';
import { GameQuestion } from '../../../domain/entities/game-question.entity';
import { GameQuestionRepositoryTypeOrm } from '../../../infrastructure/gameQuestion.repositoryTypeOrm';

export class ConnectionGameCommand {
  constructor(public userId: any) {}
}

@CommandHandler(ConnectionGameCommand)
export class ConnectionGameUseCase
  implements ICommandHandler<ConnectionGameCommand>
{
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
  ) {}
  async execute(command: ConnectionGameCommand): Promise<any> {
    let user;
    let user2;
    //поиск уже активной игры с этим юзером
    const activeGame =
      await this.gameQueryRepositoryTypeOrm.findActiveCurrentGame(
        command.userId,
      );
    if (activeGame) {
      throw new HttpException('', 403);
    }
    // поиск игры ожидающей второго игрока
    const game = await this.gameQueryRepositoryTypeOrm.findFreeGame();
    // создание игры если не нашли
    if (!game) {
      user = await this.usersRepoTypeOrm.findUserByID(command.userId);
      const createGame = Game.createGameForFirstPlayer(command.userId);
      await this.gameRepositoryTypeOrm.saveGame(createGame);
      return {
        id: createGame.id,
        firstPlayerProgress: {
          answers: [], // или пустой массив потом посмотрим
          player: {
            id: createGame.firstPlayerId,
            login: user.login,
          },
          score: createGame.scoreFirstPlayer,
        },
        secondPlayerProgress: null,
        questions: null,
        status: 'PendingSecondPlayer',
        pairCreatedDate: createGame.pairCreatedDate,
        startGameDate: null,
        finishGameDate: null,
      };
    }
    //если нашли игру ожидающую второго игрока - подключаем второго игрока
    user = await this.usersRepoTypeOrm.findUserByID(game.firstPlayerId);
    user2 = await this.usersRepoTypeOrm.findUserByID(command.userId);
    //проверяем что второй игрок не совпадает с первым
    if (user.id === user2.id) {
      throw new HttpException('', 403);
    }
    const questions =
      await this.questionsQueryRepositoryTypeOrm.getFiveRandomQuestions();
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const questionGame = GameQuestion.createGameAndJoinQuestion(
        question,
        game.id,
        i + 1,
      );
      await this.gameQuestionRepositoryTypeOrm.saveGameQuestion(questionGame);
    }
    const questionMapForView = questions.map((el) => {
      return { id: el.id, body: el.body };
    });
    game.joinSecondPlayer(command.userId, questionMapForView);
    await this.gameRepositoryTypeOrm.saveGame(game);

    return {
      id: game.id,
      firstPlayerProgress: {
        answers: [],
        player: {
          id: user.id,
          login: user.login,
        },
        score: game.scoreFirstPlayer,
      },
      secondPlayerProgress: {
        answers: [],
        player: {
          id: user2.id,
          login: user2.login,
        },
        score: game.scoreSecondPlayer,
      },
      questions: questionMapForView,
      status: 'Active',
      pairCreatedDate: game.pairCreatedDate,
      startGameDate: game.startGameDate,
      finishGameDate: null,
    };
  }
}
