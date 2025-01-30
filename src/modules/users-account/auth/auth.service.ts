import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}
  async login(username: string, userId: string) {
    const payload = { username: username, sub: userId }; // Payload токена
    return {
      accessToken: this.jwtService.sign(payload), // Создаем токен
    };
  }
}
