import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class PaginationDto {
    @Transform((params) => Number(params.value))
    @IsInt()
    @Min(1, { message: "'page' must be greater than or equal to 1" })
    page: number = 1;

    @Transform((params) => Number(params.value))
    @IsInt()
    @Min(1, { message: "'limit' must be greater than or equal to 2" })
    limit: number = 2;

    @IsString()
    @IsOptional()
    search: string;
}
