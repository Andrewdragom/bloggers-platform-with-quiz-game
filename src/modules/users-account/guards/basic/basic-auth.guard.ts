import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class AuthGuardBasicAuth implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse<Response>();
    const auth = request.headers.authorization;
    if (!auth) {
      throw new UnauthorizedException();
    }
    const buff2 = Buffer.from('admin:qwerty', 'utf8');
    const codedAuth = buff2.toString('base64');
    if (auth.slice(6) !== codedAuth) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
