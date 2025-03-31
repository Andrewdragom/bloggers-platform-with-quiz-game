import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Inject,
  Ip,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { LoginUserDto } from './input-dto/login-user.dto';
import { UsersService } from '../application/users.service';
import { LocalAuthGuard } from '../guards/bearer/auth.guard';
import { ExtractUserFromRequest } from '../guards/bearer/decorators/extract-user-from-request';
import { AuthService } from '../application/auth.service';
import { JwtAuthGuard } from '../guards/bearer/jwt-auth.guard';
import { CreateUserDto } from '../dto/create-user.dto';
import { NewPasswordDto } from './input-dto/new-password.dto';
import { UserCreateParamDecoratorContextDto } from '../dto/user-create-param-decorator-context.dto';
import { Response } from 'express';
import { SessionService } from '../application/session-service';
import { RefreshTokenGuard } from '../guards/refresh/refresh-auth.guard';
import { RateLimitGuard } from '../guards/rate-limit.guard';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(UsersService) protected usersService: UsersService,
    @Inject(AuthService) protected authService: AuthService,
    @Inject(SessionService) protected sessionService: SessionService,
  ) {}
  @Post('/login')
  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @UseGuards(RateLimitGuard)
  async login(
    @ExtractUserFromRequest() user: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
    @Headers('user-agent') userAgent: string,
    @Ip() ip: string,
  ) {
    if (user) {
      const deviceName = userAgent;
      const deviceId = (Date.now() + Math.random()).toString();
      const token = await this.authService.createToken(
        user.loginOrEmail,
        user.id,
      );
      const refreshToken = await this.authService.createRefreshToken(
        deviceId,
        user.id,
      );
      const session = await this.sessionService.saveSession(
        user.id,
        ip ? ip : '123',
        deviceName ? deviceName : 'chrome',
        deviceId,
        refreshToken.issuedDate,
      );
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return token;
    }
    return;
  }
  @UseGuards(RefreshTokenGuard)
  @Post('/refresh-token')
  @HttpCode(200)
  async refreshToken(
    @Res({ passthrough: true }) res: Response,
    @Req() req: any,
  ) {
    const session = req.session;
    const userId = await this.usersService.findUserById(session.userId);
    if (!userId) {
      throw new UnauthorizedException();
    }

    const newToken = await this.authService.createToken(
      userId.login,
      userId.userId,
    );
    const newRefreshToken = await this.authService.createRefreshToken(
      session.deviceId,
      userId.userId,
    );
    await this.sessionService.updateSessionIssuedDate(
      session.deviceId,
      newRefreshToken.issuedDate,
    );
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return newToken;
  }
  @UseGuards(RefreshTokenGuard)
  @Post('/logout')
  @HttpCode(204)
  async logout(@Req() req: any) {
    const session = req.session;
    return this.sessionService.deleteSessionByDeviceId(session.deviceId);
  }

  @Get('/me')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async getMe(
    @ExtractUserFromRequest() user: UserCreateParamDecoratorContextDto,
  ) {
    return this.usersService.findUserById(user.userId);
  }
  @Post('/registration')
  @HttpCode(204)
  @UseGuards(RateLimitGuard)
  async registration(@Body() body: CreateUserDto) {
    await this.usersService.checkLogin(body.login);
    await this.usersService.checkEmail(body.email);
    return this.usersService.createNewUserByRegistr(body);
  }
  @Post('/registration-confirmation')
  @HttpCode(204)
  @UseGuards(RateLimitGuard)
  async registrationConfirmation(@Body() body) {
    const codeConfirm = await this.usersService.confirmEmail(body.code);
    return codeConfirm;
  }
  @Post('/registration-email-resending')
  @HttpCode(204)
  @UseGuards(RateLimitGuard)
  async registrationConfirmationResending(@Body() body) {
    const codeResend =
      await this.usersService.checkEmailForResendingRegistrCode(body.email);
    return codeResend;
  }
  @Post('/password-recovery')
  @HttpCode(204)
  @UseGuards(RateLimitGuard)
  async passwordRecovery(@Body() body) {
    await this.usersService.createAndSendCodeForNewPassword(body.email);
    return;
  }
  @Post('/new-password')
  @HttpCode(204)
  @UseGuards(RateLimitGuard)
  async newPassword(@Body() body: NewPasswordDto) {
    const user = await this.usersService.findUserByCodeForNewPassword(
      body.recoveryCode,
    );
    await this.usersService.changePassword(user.id, body.newPassword);
    return;
  }
}
