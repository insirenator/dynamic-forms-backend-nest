import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Post,
    Query,
    Req,
} from '@nestjs/common';
import { QuestionBankService } from './question-bank.service';
import { Request } from '@/shared/interfaces/server';
import { PaginationDto } from './question-bank.dto';
import { IQuestionWithOptions } from '@/repositories/questions/questions.dto';

@Controller('question-bank')
export class QuestionBankController {
    constructor(private readonly questionsService: QuestionBankService) {}

    @Get()
    async getAllQuestions(@Req() req: Request, @Query() query: PaginationDto) {
        const userId = req.user.id;
        const { data, totalRows } = await this.questionsService.getAllQuestions(
            userId,
            query,
        );

        const pagination = {
            page: query.page,
            limit: query.limit,
            total_pages: Math.ceil(totalRows / query.limit),
        };

        if (query.page > pagination.total_pages) {
            throw new BadRequestException(
                `invalid page value '${query.page}'. Total pages are '${pagination.total_pages}'`,
            );
        }

        return { data, pagination: pagination };
    }

    @Post()
    async addQuestion(@Body() body: IQuestionWithOptions) {
        return body;
    }
}
