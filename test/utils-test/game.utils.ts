import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { CreateQuestionDto } from '../../src/modules/quiz/api/input-dto/create-question.dto';
import { async } from 'rxjs';

export const createQuestion = async (
  question: CreateQuestionDto,
  app: INestApplication,
) => {
  const { body } = await request(app.getHttpServer())
    .post('/sa/quiz/questions')
    .auth('admin', 'qwerty')
    .send(question as CreateQuestionDto)
    .expect(201);

  expect(body).toEqual({
    id: expect.any(String),
    body: expect.any(String),
    correctAnswers: [expect.any(String)],
    published: expect.any(Boolean),
    createdAt: expect.any(String),
    updatedAt: null,
  });

  await request(app.getHttpServer())
    .put(`/sa/quiz/questions/${body.id}/publish`)
    .auth('admin', 'qwerty')
    .send({
      published: true,
    })
    .expect(204);

  return body;
};

export const sendAnswer = async (
  answer: string,
  tokenAuth: string,
  app: INestApplication,
) => {
  await request(app.getHttpServer())
    .post(`/pair-game-quiz/pairs/my-current/answers`)
    .set('Authorization', `Bearer ${tokenAuth}`)
    .send({
      answer: answer,
    })
    .expect(200);
};

export const getCurrenGame = async (
  tokenAuth: string,
  app: INestApplication,
) => {
  const { body } = await request(app.getHttpServer())
    .get(`/pair-game-quiz/pairs/my-current`)
    .set('Authorization', `Bearer ${tokenAuth}`)
    .expect(200);
  return body;
};
