import { QUESTION_TYPES } from '@/shared/constants/questions';
import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    ValidateIf,
    ValidateNested,
} from 'class-validator';

class IBaseQuestion {
    @IsInt()
    @IsOptional()
    ques_id: number;

    @IsInt()
    @IsOptional()
    user_id: number | null | undefined;

    @IsString()
    ques_text: string;

    @IsOptional()
    created_at: Date;
}

class IOption {
    @IsInt()
    @IsOptional()
    opt_id: number;

    @IsString({ message: "'opt_value' is required and must be a string" })
    opt_value: string;
}

export class ISimpleQuestion extends IBaseQuestion {
    @IsEnum(QUESTION_TYPES)
    ques_type: QUESTION_TYPES.TEXT | QUESTION_TYPES.NUMERIC;
}

export class IQuestionWithOptions extends IBaseQuestion {
    @IsEnum(QUESTION_TYPES)
    ques_type:
        | QUESTION_TYPES.SELECT
        | QUESTION_TYPES.CHOICE
        | QUESTION_TYPES.RADIO;

    @ValidateIf((o) =>
        [
            QUESTION_TYPES.RADIO,
            QUESTION_TYPES.CHOICE,
            QUESTION_TYPES.SELECT,
        ].includes(o.ques_type),
    )
    @ValidateNested({ each: true })
    @ArrayMinSize(1, { message: 'at least 1 option is required' })
    @Type(() => IOption)
    options: IOption[];
}

export type QuestionDto = ISimpleQuestion | IQuestionWithOptions;
