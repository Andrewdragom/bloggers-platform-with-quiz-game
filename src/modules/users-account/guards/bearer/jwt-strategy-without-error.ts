import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../application/users.service';
import { JwtConfig } from '../../user-account.config';

@Injectable()
export class JwtStrategyWithoutError extends PassportStrategy(
  Strategy,
  'jwtWithoutError',
) {
  constructor(
    @Inject(UsersService) protected usersService: UsersService,
    @Inject(JwtConfig) protected jwtConfig: JwtConfig,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConfig.secretForToken,
    });
  }

  async validate(payload: any) {
    const user = this.usersService.findUserById(payload.sub);

    return { userId: payload.sub };
  }
}
