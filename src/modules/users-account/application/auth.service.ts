import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}
  async createToken(username: string, userId: string) {
    const payload = { username: username, sub: userId }; // Payload токена
    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: '10m' }), // Создаем токен
    };
  }
  async createRefreshToken(deviceId: string, userId: string) {
    const payload = { deviceId: deviceId, sub: userId }; // Payload токена
    return {
      refreshToken: this.jwtService.sign(payload, { expiresIn: '20m' }),
      issuedDate: new Date(), // Создаем токен
    };
  }
}
