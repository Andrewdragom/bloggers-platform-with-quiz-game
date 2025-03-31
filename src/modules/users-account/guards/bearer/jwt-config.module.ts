import { Global, Module } from '@nestjs/common';
import { JwtConfig } from '../../user-account.config';
@Global()
@Module({
  providers: [JwtConfig],
  exports: [JwtConfig],
})
export class JwtConfigModule {}
