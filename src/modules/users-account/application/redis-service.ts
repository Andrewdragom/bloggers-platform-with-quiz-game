import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  async onModuleInit() {
    this.client = new Redis({
      host: 'localhost', // Если в Docker, можно использовать 'redis'
      port: 6379, // Стандартный порт Redis
    });
  }

  async increment(key: string, ttl: number): Promise<number> {
    const count = await this.client.incr(key);
    if (count === 1) {
      await this.client.expire(key, ttl); // Устанавливаем TTL при первом запросе
    }
    return count;
  }

  async get(key: string): Promise<number> {
    const value = await this.client.get(key);
    return value ? parseInt(value, 10) : 0;
  }

  async onModuleDestroy() {
    await this.client.quit(); // Закрываем соединение при завершении
  }
}
