import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionGameUseCase } from '../../src/modules/quiz/application/use-cases/game/connection-game-use-case';
import { QuestionsQueryRepositoryTypeOrm } from '../../src/modules/quiz/infrastructure/questions.queryRepositoryTypeOrm';
import { GameQueryRepositoryTypeOrm } from '../../src/modules/quiz/infrastructure/game.queryRepository';
import { GameRepositoryTypeOrm } from '../../src/modules/quiz/infrastructure/game.repositoryTypeOrm';
import { UsersRepositoryTypeOrm } from '../../src/modules/users-account/infrastructure/users.repositoryTypeOrm';
import { GameQuestionRepositoryTypeOrm } from '../../src/modules/quiz/infrastructure/gameQuestion.repositoryTypeOrm';

describe('ConnectionGameUseCase (integration)', () => {
  // "testRegex": ".*\\.spec\\.ts$", -----------------------------------для запуска теста изменить jest-e2e.json
  let useCase: ConnectionGameUseCase;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        ConnectionGameUseCase,
        QuestionsQueryRepositoryTypeOrm,
        GameQueryRepositoryTypeOrm,
        GameRepositoryTypeOrm,
        UsersRepositoryTypeOrm,
        GameQuestionRepositoryTypeOrm,
      ],
    })
      .overrideProvider(QuestionsQueryRepositoryTypeOrm)
      .useValue({
        getFiveRandomQuestions: jest.fn().mockResolvedValue([
          { id: 'q1', body: 'What is NestJS?' },
          { id: 'q2', body: 'What is CQRS?' },
          { id: 'q3', body: 'What is DI?' },
          { id: 'q4', body: 'What is a module?' },
          { id: 'q5', body: 'What is a controller?' },
        ]),
      })
      .overrideProvider(GameQueryRepositoryTypeOrm)
      .useValue({
        findActiveCurrentGame: jest.fn().mockResolvedValue(null),
        findFreeGame: jest.fn().mockResolvedValue(null),
      })
      .overrideProvider(UsersRepositoryTypeOrm)
      .useValue({
        findUserByID: jest.fn().mockImplementation((id) => ({
          id,
          login: `user_${id}`,
        })),
      })
      .overrideProvider(GameRepositoryTypeOrm)
      .useValue({
        saveGame: jest.fn(),
      })
      .overrideProvider(GameQuestionRepositoryTypeOrm)
      .useValue({
        saveGameQuestion: jest.fn(),
      })
      .compile();

    useCase = moduleRef.get(ConnectionGameUseCase);
  });

  it('should create a new game when no active or free game exists', async () => {
    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.firstPlayerProgress.player.id).toBe('user-1');
    expect(result.status).toBe('PendingSecondPlayer');
    expect(result.questions).toBeNull();
  });
});
