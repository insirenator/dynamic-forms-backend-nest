import { Module } from '@nestjs/common';
import { UsersRepository } from './users/users.repository';
import { RefreshTokensRepository } from './refresh-tokens/refresh-tokens.repository';

@Module({
    providers: [UsersRepository, RefreshTokensRepository],
    exports: [UsersRepository, RefreshTokensRepository],
})
export class RepositoriesModule {}
