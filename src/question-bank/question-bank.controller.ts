import { Controller, Get, Req } from '@nestjs/common';
import { QuestionBankService } from './question-bank.service';
import { Request } from '@/shared/interfaces/server';

@Controller('question-bank')
export class QuestionBankController {
    constructor(private readonly questionsService: QuestionBankService) {}

    @Get()
    async getAllQuestions(@Req() req: Request) {
        const userId = req.user.id;
        return await this.questionsService.getAllQuestions(userId);
    }
}
