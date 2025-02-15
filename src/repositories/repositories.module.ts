import { Module } from '@nestjs/common';
import { UsersRepository } from './users/users.repository';
import { RefreshTokensRepository } from './refresh-tokens/refresh-tokens.repository';
import { QuestionsRepository } from './questions/questions.repository';
import { UtilsModule } from '@/shared/utils/utils.module';

@Module({
    imports: [UtilsModule],
    providers: [UsersRepository, RefreshTokensRepository, QuestionsRepository],
    exports: [UsersRepository, RefreshTokensRepository, QuestionsRepository],
})
export class RepositoriesModule {}
