import { Module } from '@nestjs/common';
import { QuestionBankController } from './question-bank.controller';
import { QuestionBankService } from './question-bank.service';
import { RepositoriesModule } from '@/repositories/repositories.module';

@Module({
    imports: [RepositoriesModule],
    controllers: [QuestionBankController],
    providers: [QuestionBankService],
})
export class QuestionBankModule {}
