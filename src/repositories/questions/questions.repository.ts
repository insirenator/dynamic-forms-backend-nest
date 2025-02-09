import { Injectable } from '@nestjs/common';
import { Pool } from 'mysql2/promise';
import { InjectClient } from 'nest-mysql';
import { BaseRepository } from '../base.repository';
import { QuestionDto } from './questions.dto';

@Injectable()
export class QuestionsRepository extends BaseRepository<QuestionDto> {
    constructor(@InjectClient() connectionPool: Pool) {
        super('questions', connectionPool);
    }

    async getAllQuestions(userId: number) {
        const questions = await this.selectFromTable(
            'questions',
            ['ques_id', 'ques_text', 'ques_type', 'created_at'],
            { where: 'user_id = ? OR user_id IS NULL', values: [userId] },
        );

        const questionIds = questions.map((ques) => ques.ques_id);

        const options = await this.selectFromTable('options', ['*'], {
            where: 'ques_id IN (?)',
            values: [questionIds],
        });

        questions.forEach((ques) => {
            if (['text', 'numeric'].includes(ques.ques_type)) return;

            const opts = options
                .filter((opt) => opt.ques_id === ques.ques_id)
                .map(({ opt_id, opt_value }) => ({ opt_id, opt_value }));

            if (opts && opts.length) {
                ques.options = opts;
            }
        });

        return questions;
    }
}
