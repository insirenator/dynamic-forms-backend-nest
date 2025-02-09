import { Module } from '@nestjs/common';
import { UsersRepository } from './users/users.repository';
import { RefreshTokensRepository } from './refresh-tokens/refresh-tokens.repository';
import { QuestionsRepository } from './questions/questions.repository';

@Module({
    providers: [UsersRepository, RefreshTokensRepository, QuestionsRepository],
    exports: [UsersRepository, RefreshTokensRepository, QuestionsRepository],
})
export class RepositoriesModule {}
