import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { RedisService } from '../application/redis-service';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private readonly redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const ip = req.ip; // Ограничение по IP-адресу
    const route = req.path; // Учитываем маршрут
    const key = `rate-limit:${ip}:${route}`; // Разделяем лимиты по эндпоинтам

    const maxRequests = 50; // 5 запросов
    const timeWindow = 1000; // 10 секунд

    const requestCount = await this.redisService.increment(key, timeWindow);

    if (requestCount > maxRequests) {
      throw new HttpException('Too Many Requests', 429);
    }

    return true;
  }
}
