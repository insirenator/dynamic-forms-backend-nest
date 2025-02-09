import { QuestionsRepository } from '@/repositories/questions/questions.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class QuestionBankService {
    constructor(private readonly questionsRepository: QuestionsRepository) {}

    getAllQuestions(userId: number) {
        return this.questionsRepository.getAllQuestions(userId);
    }
}
