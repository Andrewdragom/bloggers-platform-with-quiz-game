import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { SessionService } from '../../application/session-service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private readonly sessionService: SessionService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    // Получаем refreshToken из cookie
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException();
    }
    try {
      const decoded = this.jwtService.verify(refreshToken.refreshToken, {
        secret: '123',
      });
    } catch (error) {
      throw new UnauthorizedException();
    }

    const session = await this.sessionService.getSessionByIssuedDate(
      refreshToken.issuedDate,
    );
    if (!session) {
      throw new UnauthorizedException();
    }

    // Добавляем сессию в request
    req['session'] = session;

    return true;
  }
}
