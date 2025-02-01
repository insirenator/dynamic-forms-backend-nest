import { IsDate, IsEmail, IsInt, IsString } from 'class-validator';

export class UserDto {
    @IsInt()
    id: number;

    @IsString()
    username: string;

    @IsEmail()
    email: string;

    @IsString()
    password: string;

    @IsInt()
    verified: number;

    @IsDate()
    created_at: Date;

    @IsDate()
    updated_at: Date;
}
