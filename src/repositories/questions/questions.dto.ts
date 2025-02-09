interface IBaseQuestion {
    ques_id: number;
    user_id: number | null | undefined;
    ques_text: string;
    created_at: Date;
}

interface IOption {
    opt_id: number;
    opt_value: string;
}

interface ISimpleQuestion extends IBaseQuestion {
    ques_type: 'text' | 'numeric';
}

interface IQuestionWithOptions extends IBaseQuestion {
    ques_type: 'select' | 'choice' | 'radio';
    options: IOption[];
}

export type QuestionDto = ISimpleQuestion | IQuestionWithOptions;
