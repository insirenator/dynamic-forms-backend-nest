import { QuestionsRepository } from '@/repositories/questions/questions.repository';
import { Injectable } from '@nestjs/common';
import { PaginationDto } from './question-bank.dto';

@Injectable()
export class QuestionBankService {
    constructor(private readonly questionsRepository: QuestionsRepository) {}

    async getAllQuestions(userId: number, pagination: PaginationDto) {
        const { data: questions, totalRows: totalQuestions } =
            await this.questionsRepository.getQuestions(userId, pagination);

        const questionIds = questions.map((ques) => ques.ques_id);

        const options =
            await this.questionsRepository.getQuestionOptions(questionIds);

        questions.forEach((ques) => {
            if (['text', 'numeric'].includes(ques.ques_type)) return;

            const opts = options
                .filter((opt) => opt.ques_id === ques.ques_id)
                .map(({ opt_id, opt_value }) => ({ opt_id, opt_value }));

            if (opts && opts.length) {
                ques.options = opts;
            }
        });

        return { data: questions, totalRows: totalQuestions };
    }
}
