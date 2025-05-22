import { INestApplication } from '@nestjs/common';
import { Connection } from 'typeorm';
import { getApp } from '../utils-test/utils';
import { loginUser } from '../utils-test/user.utils';
import request from 'supertest';
import {
  createQuestion,
  getCurrenGame,
  sendAnswer,
} from '../utils-test/game.utils';

describe('Game - /pair-game-quiz/pairs', () => {
  const user = {
    login: 'andrew',
    password: 'dadada',
    email: 'andreasdragomirov@yandex.com',
  };
  const user2 = {
    login: 'andrew2',
    password: 'dadada',
    email: 'andreasdragomirov2@yandex.com',
  };
  const question = [
    {
      body: 'What is the capital of France?',
      correctAnswers: ['Correct answer'],
    },
    {
      body: 'Which planet is known as the Red Planet?',
      correctAnswers: ['Correct answer'],
    },
    {
      body: 'What is 2 + 2?',
      correctAnswers: ['Correct answer'],
    },
    {
      body: 'What is the chemical symbol for water?',
      correctAnswers: ['Correct answer'],
    },
    {
      body: "Who wrote '1984'?",
      correctAnswers: ['Correct answer'],
    },
  ];

  let app: INestApplication;
  let connection: Connection;

  beforeAll(async () => {
    app = await getApp();
    await app.init();
    connection = app.get(Connection);
  });

  it('Create game [POST /pair-game-quiz/pairs/connection]', async () => {
    const tokenForPlayerFirst = await loginUser(user, app);
    const tokenForPlayerSecond = await loginUser(user2, app);
    //создание вопросов
    await createQuestion(question[0], app);
    await createQuestion(question[1], app);
    await createQuestion(question[2], app);
    await createQuestion(question[3], app);
    await createQuestion(question[4], app);
    //подключение первого игрока
    await request(app.getHttpServer())
      .post(`/pair-game-quiz/pairs/connection`)
      .set('Authorization', `Bearer ${tokenForPlayerFirst.accessToken}`)
      .expect(200);
    // подключение второго игрока
    await request(app.getHttpServer())
      .post(`/pair-game-quiz/pairs/connection`)
      .set('Authorization', `Bearer ${tokenForPlayerSecond.accessToken}`)
      .expect(200);
    //отправка правильного ответа от первого икрока
    await sendAnswer('Correct answer', tokenForPlayerFirst.accessToken, app);

    //отправка правильных ответов от второго игрока
    await sendAnswer('Correct answer', tokenForPlayerSecond.accessToken, app);
    await sendAnswer('Correct answer', tokenForPlayerSecond.accessToken, app);
    await sendAnswer('Correct answer', tokenForPlayerSecond.accessToken, app);
    await sendAnswer('Correct answer', tokenForPlayerSecond.accessToken, app);

    //запрос - проверка текущей игры
    const game = await getCurrenGame(tokenForPlayerSecond.accessToken, app);
    // отправка ответов от первого
    await sendAnswer('Corr answer', tokenForPlayerFirst.accessToken, app);
    await sendAnswer('Correct answer', tokenForPlayerFirst.accessToken, app);
    await sendAnswer('Incorrect answer', tokenForPlayerFirst.accessToken, app);
    await sendAnswer('Correct answer', tokenForPlayerFirst.accessToken, app);
    // последний ответ от второго игрока
    await sendAnswer('Correct answer', tokenForPlayerSecond.accessToken, app);

    // запрос - получение игры по айди после завершения игры
    const { body } = await request(app.getHttpServer())
      .get(`/pair-game-quiz/pairs/${game.id}`)
      .set('Authorization', `Bearer ${tokenForPlayerSecond.accessToken}`)
      .expect(200);

    expect(body).toEqual({
      id: body.id,
      firstPlayerProgress: {
        answers: expect.any(Array),
        player: {
          id: expect.any(String),
          login: user.login,
        },
        score: 4,
      },
      secondPlayerProgress: {
        answers: expect.any(Array),
        player: {
          id: expect.any(String),
          login: user2.login,
        },
        score: 5,
      },
      questions: expect.any(Array),
      status: 'Finished',
      pairCreatedDate: expect.any(String),
      startGameDate: expect.any(String),
      finishGameDate: expect.any(String),
    });

    //подключение первого игрока
    await request(app.getHttpServer())
      .post(`/pair-game-quiz/pairs/connection`)
      .set('Authorization', `Bearer ${tokenForPlayerFirst.accessToken}`)
      .expect(200);
    // подключение второго игрока
    await request(app.getHttpServer())
      .post(`/pair-game-quiz/pairs/connection`)
      .set('Authorization', `Bearer ${tokenForPlayerSecond.accessToken}`)
      .expect(200);
    //отправка правильного ответа от первого икрока
    await sendAnswer('Corre answer', tokenForPlayerFirst.accessToken, app);

    //отправка правильных ответов от второго игрока
    await sendAnswer('Correct answer', tokenForPlayerSecond.accessToken, app);
    await sendAnswer('Correct answer', tokenForPlayerSecond.accessToken, app);
    await sendAnswer('Correct answer', tokenForPlayerSecond.accessToken, app);
    await sendAnswer('Correct answer', tokenForPlayerSecond.accessToken, app);

    //запрос - проверка текущей игры
    const game2 = await getCurrenGame(tokenForPlayerSecond.accessToken, app);
    // отправка ответов от первого
    await sendAnswer('Correct answer', tokenForPlayerFirst.accessToken, app);
    await sendAnswer('Correct answer', tokenForPlayerFirst.accessToken, app);
    await sendAnswer(' answer', tokenForPlayerFirst.accessToken, app);
    await sendAnswer('Correct answer', tokenForPlayerSecond.accessToken, app);
    // последний ответ от первого игрока

    await sendAnswer('Incorrect answer', tokenForPlayerFirst.accessToken, app);

    // запрос - получение игры по айди после завершения игры
    await request(app.getHttpServer())
      .get(`/pair-game-quiz/pairs/${game.id}`)
      .set('Authorization', `Bearer ${tokenForPlayerSecond.accessToken}`)
      .expect(200);
  });
});
