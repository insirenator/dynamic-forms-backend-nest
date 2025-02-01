import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
    @IsEmail()
    email: string;

    @IsString()
    password: string;
}

export class SignUpDto {
    @IsString()
    username: string;

    @IsEmail()
    email: string;

    @IsString()
    password: string;
}

export class ChangePasswordDto {
    @IsString()
    oldPassword: string;

    @IsString()
    newPassword: string;
}
