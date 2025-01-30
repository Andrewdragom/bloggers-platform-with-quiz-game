import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './users/users.schema';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { UsersRepository } from './users/users.repository';
import { AuthController } from './auth/auth.controller';
import { LocalStrategy } from './guards/bearer/local-strategy-auth.guard';
import { JwtStrategy } from './guards/bearer/jwt-strategy';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth/auth.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'users', schema: UserSchema }]),
    JwtModule.register({
      secret: '123', // Должен совпадать с secretOrKey в JwtStrategy
      signOptions: { expiresIn: '1h' },
    }),
    NotificationsModule,
  ],
  controllers: [UsersController, AuthController],
  providers: [
    UsersService,
    UsersRepository,
    LocalStrategy,
    JwtStrategy,
    AuthService,
  ],
  exports: [
    MongooseModule.forFeature([{ name: 'users', schema: UserSchema }]),
    JwtModule,
  ],
})
export class UserAccountModule {}
