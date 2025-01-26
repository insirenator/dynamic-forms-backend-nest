import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpException,
    HttpStatus,
    Post,
    Res,
    ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '@/repositories/users/users.dto';
import { Response } from 'express';
import { LoginDto } from './auth.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('signup')
    async signup(@Body(new ValidationPipe()) signupPayload: CreateUserDto) {
        try {
            await this.authService.signup(signupPayload);
            return { message: 'user signed up successfully' };
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new HttpException(
                    `email '${signupPayload.email}' is already in use.`,
                    HttpStatus.BAD_REQUEST,
                );
            }
            console.error(error);
            throw new HttpException(
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('login')
    @HttpCode(200)
    async login(
        @Body(new ValidationPipe()) loginPayload: LoginDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const signedTokens = await this.authService.login(loginPayload);

        res.cookie('accessToken', signedTokens.accessToken, {
            httpOnly: true,
            sameSite: 'strict',
        });
        res.cookie('refreshToken', signedTokens.refreshToken, {
            httpOnly: true,
            sameSite: 'strict',
        });

        return { message: 'user logged in successfully' };
    }

    @Get('profile')
    async profile() {
        return [];
    }
}
