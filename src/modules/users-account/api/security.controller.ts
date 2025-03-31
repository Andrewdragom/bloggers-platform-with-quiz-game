import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { SessionService } from '../application/session-service';
import { UsersService } from '../application/users.service';
import { RefreshTokenGuard } from '../guards/refresh/refresh-auth.guard';

@Controller('security')
export class SecurityController {
  constructor(
    @Inject(SessionService) protected sessionService: SessionService,
    @Inject(UsersService) protected usersService: UsersService,
  ) {}
  @UseGuards(RefreshTokenGuard)
  @Get('/devices')
  async getDevices(@Req() req: any) {
    const session = req.session;
    const userId = await this.usersService.findUserById(session.userId);
    if (!userId) {
      throw new UnauthorizedException();
    }
    return this.sessionService.getAllSessionsByUserId(userId.userId);
  }
  @UseGuards(RefreshTokenGuard)
  @Delete('/devices')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllSessions(@Req() req: any) {
    const session = req.session;
    return await this.sessionService.deleteAllSessionByDeviceId(
      session.deviceId,
    );
  }
  @UseGuards(RefreshTokenGuard)
  @Delete('/devices/:deviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSessionById(@Req() req: any, @Param('deviceId') id: string) {
    const session = req.session;
    const userId = await this.usersService.findUserById(session.userId);
    if (!userId) {
      throw new UnauthorizedException();
    }
    const getSessionById = await this.sessionService.getSessionByDeviceId(id);
    if (userId.userId != getSessionById) {
      throw new HttpException('', 403);
    }
    return this.sessionService.deleteSessionByDeviceId(id);
  }
}
