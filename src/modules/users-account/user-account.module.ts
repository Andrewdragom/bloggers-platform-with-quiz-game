import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './domain/users.schema';
import { UsersController } from './api/users.controller';
import { UsersService } from './application/users.service';
import { UsersRepositoryMongo } from './infrastructure/users.repositoryMongo';
import { AuthController } from './api/auth.controller';
import { LocalStrategy } from './guards/bearer/local-strategy-auth.guard';
import { JwtStrategy } from './guards/bearer/jwt-strategy';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './application/auth.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { JwtConfigModule } from './guards/bearer/jwt-config.module';
import { JwtConfig } from './user-account.config';
import { CreateUserUseCase } from './application/use-cases/create-user-use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtStrategyWithoutError } from './guards/bearer/jwt-strategy-without-error';
import { SessionSchema } from './domain/session.schema';
import { SessionService } from './application/session-service';
import { SessionRepositoryMongo } from './infrastructure/session.repositoryMongo';
import { SecurityController } from './api/security.controller';
import { RedisService } from './application/redis-service';
import { UsersRepositoryPostgres } from './infrastructure/users.repositoryPostgres';
import { SessionRepositoryPostgres } from './infrastructure/session.repositoryPostgres';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './domain/entities/user.entity';
import { NewPassword } from './domain/entities/newPassword.entity';
import { EmailConfirmation } from './domain/entities/emailConfirmation.entity';
import { UsersRepositoryTypeOrm } from './infrastructure/users.repositoryTypeOrm';
import { UsersQueryRepoTypeOrm } from './infrastructure/users.queryRepoTypeOrm';
import { DeleteUserUseCase } from './application/use-cases/delete-user-use-case';
import { Session } from './domain/entities/session.entity';
import { SessionRepositoryTypeOrm } from './infrastructure/session.repositoryTypeOrm';

const CommandHandlers = [CreateUserUseCase, DeleteUserUseCase];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'users', schema: UserSchema },
      { name: 'sessions', schema: SessionSchema },
    ]),
    JwtModule.registerAsync({
      useFactory: (userAccountConfig: JwtConfig) => {
        return {
          secret: userAccountConfig.secretForToken,
          signOptions: { expiresIn: '20s' },
        };
      },
      inject: [JwtConfig],
    }),
    TypeOrmModule.forFeature([User, EmailConfirmation, NewPassword, Session]), ////////////
    NotificationsModule,
    JwtConfigModule,
    CqrsModule,
  ],
  controllers: [UsersController, AuthController, SecurityController],
  providers: [
    UsersService,
    UsersRepositoryMongo,
    LocalStrategy,
    JwtStrategy,
    AuthService,
    ...CommandHandlers,
    JwtStrategyWithoutError,
    SessionService,
    SessionRepositoryMongo,
    RedisService,
    UsersRepositoryPostgres,
    SessionRepositoryPostgres,
    UsersRepositoryTypeOrm,
    UsersQueryRepoTypeOrm,
    SessionRepositoryTypeOrm,
  ],
  exports: [
    MongooseModule.forFeature([
      { name: 'users', schema: UserSchema },
      { name: 'sessions', schema: SessionSchema },
    ]),
    JwtModule,
    UsersService,
    UsersRepositoryTypeOrm,
  ],
})
export class UserAccountModule {}
