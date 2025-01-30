import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(@Inject(UsersService) protected usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: '123',
    });
  }

  async validate(payload: any) {
    const user = this.usersService.findUserById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return { userId: payload.sub };
  }
}
