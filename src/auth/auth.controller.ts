import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpException,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
    Res,
    ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '@/repositories/users/users.dto';
import { Response } from 'express';
import { LoginDto } from './auth.dto';
import { Public } from '@/shared/decorators/auth.decorators';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('signup')
    @Public()
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

    @Get('signup/resend-verify-email/:userId')
    @Public()
    async resendVerifySignUpEmail(
        @Param('userId', ParseIntPipe) userId: number,
    ) {
        await this.authService.resendVerificationEmail(userId);
        return { message: 'verification email sent' };
    }

    @Get('signup/verify/:token')
    @Public()
    async verifySignUp(@Param('token') verifyToken: string) {
        await this.authService.verifySignUp(verifyToken);
        return { message: 'user verified successfully' };
    }

    @Post('login')
    @HttpCode(200)
    @Public()
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
    async profile(@Res({ passthrough: true }) res: Response) {
        return {
            id: res.locals.user.id,
            username: res.locals.user.username,
            email: res.locals.user.email,
            verified: res.locals.user.verified,
        };
    }
}
