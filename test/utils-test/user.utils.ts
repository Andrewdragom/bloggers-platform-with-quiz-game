import request from 'supertest';
import { CreateUserDto } from '../../src/modules/users-account/dto/create-user.dto';
import { INestApplication } from '@nestjs/common';
import { LoginUserDto } from '../../src/modules/users-account/api/input-dto/login-user.dto';

export const createUser = async (
  user: CreateUserDto,
  app: INestApplication,
) => {
  const { body } = await request(app.getHttpServer())
    .post(`/sa/users`)
    .auth('admin', 'qwerty')
    .send(user as CreateUserDto)
    .expect(201);

  expect(body).toEqual({
    id: expect.any(String),
    login: user.login,
    email: user.email,
    createdAt: expect.any(String),
  });
  return body;
};

export const loginUser = async (user: CreateUserDto, app: INestApplication) => {
  await createUser(user, app);
  const { body } = await request(app.getHttpServer())
    .post(`/auth/login`)
    .send({
      loginOrEmail: user.login,
      password: user.password,
    } as LoginUserDto)
    .expect(200);

  expect(body).toEqual({
    accessToken: expect.any(String),
  });
  return body;
};
