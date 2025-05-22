import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, Inject } from '@nestjs/common';
import { QuestionsQueryRepositoryTypeOrm } from '../../../infrastructure/questions.queryRepositoryTypeOrm';
import { GameQueryRepositoryTypeOrm } from '../../../infrastructure/game.queryRepository';
import { Game } from '../../../domain/entities/game.entity';
import { GameRepositoryTypeOrm } from '../../../infrastructure/game.repositoryTypeOrm';
import { UsersRepositoryTypeOrm } from '../../../../users-account/infrastructure/users.repositoryTypeOrm';
import { GameQuestion } from '../../../domain/entities/game-question.entity';
import { GameQuestionRepositoryTypeOrm } from '../../../infrastructure/gameQuestion.repositoryTypeOrm';
import { Player } from '../../../domain/entities/player.entity';
import { PlayerRepositoryTypeOrm } from '../../../infrastructure/player.repositoryTypeOrm';
import { PlayerQueryRepositoryTypeOrm } from '../../../infrastructure/player.queryRepo';

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
    @Inject(PlayerRepositoryTypeOrm)
    protected playerRepositoryTypeOrm: PlayerRepositoryTypeOrm,
    @Inject(PlayerQueryRepositoryTypeOrm)
    protected playerQueryRepositoryTypeOrm: PlayerQueryRepositoryTypeOrm,
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
      // ищем плеер для юзера
      const player = await this.playerQueryRepositoryTypeOrm.findPlayer(
        command.userId,
      );
      //если нету плеера создаем
      if (!player) {
        const createPlayer = Player.createPlayer(command.userId);
        await this.playerRepositoryTypeOrm.savePlayer(createPlayer);
      }
      const createGame = Game.createGameForFirstPlayer(command.userId);
      await this.gameRepositoryTypeOrm.saveGame(createGame);
      return {
        id: createGame.id,
        firstPlayerProgress: {
          answers: [],
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
    // запрашиваем 5 рандомных вопросов
    const questions =
      await this.questionsQueryRepositoryTypeOrm.getFiveRandomQuestions();
    //связываем каждый вопрос с текущем айди игры и добавлям к ним индекс
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
    //ищем плеера для юзера
    const player = await this.playerQueryRepositoryTypeOrm.findPlayer(
      command.userId,
    );
    //если нету плеера то создаем
    if (!player) {
      const createPlayer = Player.createPlayer(command.userId);
      await this.playerRepositoryTypeOrm.savePlayer(createPlayer);
    }
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
