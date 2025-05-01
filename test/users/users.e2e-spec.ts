import { INestApplication } from '@nestjs/common';
import { Connection } from 'typeorm';
import { clearBDAfterEachTest, getApp } from '../utils-test/utils';
import { createUser, loginUser } from '../utils-test/user.utils';

describe('users - /users (e2e) and auth /auth (e2e)', () => {
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
  let app: INestApplication;
  let connection: Connection;

  beforeAll(async () => {
    app = await getApp();
    await app.init();
    connection = app.get(Connection);
  });
  it('Create user [POST /users]', async () => {
    await createUser(user, app);
  });

  it('Login user [POST /auth/login]', async () => {
    await loginUser(user, app);
  });

  afterEach(async () => {
    await clearBDAfterEachTest(connection);
  });
  afterAll(async () => {
    await app.close(); // обязательно
  });
});
