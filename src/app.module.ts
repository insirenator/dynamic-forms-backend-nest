import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { RepositoriesModule } from './repositories/repositories.module';

@Module({
  imports: [AuthModule, RepositoriesModule],
})
export class AppModule {}
