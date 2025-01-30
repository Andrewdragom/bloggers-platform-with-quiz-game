import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LoginUserDto } from './dto/login-user.dto';
import { UsersService } from '../users/users.service';
import { LocalAuthGuard } from '../guards/bearer/auth.guard';
import { ExtractUserFromRequest } from '../guards/bearer/decorators/extract-user-from-request';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../guards/bearer/jwt-auth.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { NewPasswordDto } from '../users/dto/new-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(UsersService) protected usersService: UsersService,
    @Inject(AuthService) protected authService: AuthService,
  ) {}
  @Post('/login')
  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  async login(@ExtractUserFromRequest() user: LoginUserDto) {
    if (user) {
      const token = await this.authService.login(user.loginOrEmail, user.id);
      return token;
    }
    return;
  }
  @Get('/me')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async getMe(@ExtractUserFromRequest() user) {
    return this.usersService.findUserById(user.userId);
  }
  @Post('/registration')
  @HttpCode(204)
  async registration(@Body() body: CreateUserDto) {
    await this.usersService.checkLogin(body.login);
    await this.usersService.checkEmail(body.email);
    return this.usersService.createNewUserByRegistr(body);
  }
  @Post('/registration-confirmation')
  @HttpCode(204)
  async registrationConfirmation(@Body() body) {
    const codeConfirm = await this.usersService.confirmEmail(body.code);
    return codeConfirm;
  }
  @Post('/registration-email-resending')
  @HttpCode(204)
  async registrationConfirmationResending(@Body() body) {
    const codeResend =
      await this.usersService.checkEmailForResendingRegistrCode(body.email);
    return codeResend;
  }
  @Post('/password-recovery')
  @HttpCode(204)
  async passwordRecovery(@Body() body) {
    await this.usersService.createAndSendCodeForNewPassword(body.email);
    return;
  }
  @Post('/new-password')
  @HttpCode(204)
  async newPassword(@Body() body: NewPasswordDto) {
    const user = await this.usersService.findUserByCodeForNewPassword(
      body.recoveryCode,
    );
    await this.usersService.changePassword(user.id, body.newPassword);
    return;
  }
}
