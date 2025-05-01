import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { testOrmConfig } from '../ormconfig.test';
import { BloggersPlatformModule } from '../../src/modules/bloggers-platform/bloggers-platform.module';
import { UserAccountModule } from '../../src/modules/users-account/user-account.module';
import { JwtConfigModule } from '../../src/modules/users-account/guards/bearer/jwt-config.module';
import { configModule } from '../../src/config';
import { CoreModule } from '../../src/core/core.module';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { ValidationError } from '../../src/core/exception/interface-errors';
import cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from '../../src/core/exception/exception-filter';

export const getApp = async () => {
  let app: INestApplication;

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot(testOrmConfig),
      BloggersPlatformModule,
      UserAccountModule,
      JwtConfigModule,
      configModule,
      CoreModule,
    ],
    providers: [ConfigService],
  }).compile();

  app = moduleFixture.createNestApplication();
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const errorsForResponse: { message: string; field: string }[] = [];

        errors.forEach((e) => {
          if (e && e.constraints) {
            Object.keys(e.constraints).forEach((cKey) => {
              if (e.constraints && e.constraints[cKey]) {
                errorsForResponse.push({
                  message: e.constraints[cKey],
                  field: e.property,
                });
              }
            });
          }
        });
        throw new BadRequestException(errorsForResponse);
      },
    }),
  );
  app.use(cookieParser());
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.init();
  return app;
};

export const clearBDAfterEachTest = async (connection) => {
  try {
    // Очистка базы данных

    const entities = connection.entityMetadatas;
    for (const entity of entities) {
      const repository = connection.getRepository(entity.name);
      await repository.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE`);
    }
  } catch (error) {
    console.error('Error clearing database:', error);
  }
};
