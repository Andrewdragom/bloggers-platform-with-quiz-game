import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuardWithoutError extends AuthGuard('jwtWithoutError') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      return (await super.canActivate(context)) as boolean; // ✅ Ждём результат
    } catch {
      return true; // ✅ Если ошибка (нет токена), пропускаем дальше
    }
  }
}
