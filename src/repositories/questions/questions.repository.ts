import { Injectable } from '@nestjs/common';
import { Pool } from 'mysql2/promise';
import { InjectClient } from 'nest-mysql';
import { BaseRepository, WhereObjType } from '../base.repository';
import { QuestionDto } from './questions.dto';
import { PaginationDto } from '@/question-bank/question-bank.dto';
import { UtilsService } from '@/shared/utils/utils.service';

@Injectable()
export class QuestionsRepository extends BaseRepository<QuestionDto> {
    constructor(
        @InjectClient() connectionPool: Pool,
        private readonly utilsService: UtilsService,
    ) {
        super('questions', connectionPool);
    }

    async getQuestions(userId: number, pagination: PaginationDto) {
        const whereObj: WhereObjType = {
            where: '(user_id = ? OR user_id IS NULL)',
            values: [userId],
        };

        if (pagination.search) {
            whereObj.where += ' ' + 'AND ques_text LIKE ?';
            whereObj.values.push(`%${pagination.search}%`);
        }

        const limitOffset = this.utilsService.createLimitAndOffset(
            pagination.limit,
            pagination.page,
        );

        const questionsQuery = this.selectFromTable(
            'questions',
            ['ques_id', 'ques_text', 'ques_type', 'created_at'],
            whereObj,
            limitOffset,
        );

        const questionsRowCountQuery = this.selectOneFromTable(
            'questions',
            ['COUNT(1) as questionsRowCount'],
            whereObj,
        );

        const [questions, { questionsRowCount }] = await Promise.all([
            questionsQuery,
            questionsRowCountQuery,
        ]);

        return { data: questions, totalRows: questionsRowCount };
    }

    async getQuestionOptions(questionIds: number[]) {
        if (!questionIds.length) {
            return [];
        }
        const options = await this.selectFromTable('options', ['*'], {
            where: 'ques_id IN (?)',
            values: [questionIds],
        });

        return options;
    }
}
