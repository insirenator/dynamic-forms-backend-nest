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
    Req,
    Res,
    ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import {
    ChangePasswordDto,
    LoginDto,
    ResetPasswordDto,
    ResetPasswordEmailDto,
    SignUpDto,
} from './auth.dto';
import { Public } from '@/shared/decorators/auth.decorators';
import { Request } from '@/shared/interfaces/server';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('signup')
    @Public()
    async signup(@Body(new ValidationPipe()) signupPayload: SignUpDto) {
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
    async profile(@Req() req: Request) {
        const user = req.user;
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            verified: user.verified,
        };
    }

    @Get('logout')
    async logout(
        @Res({ passthrough: true }) res: Response,
        @Req() req: Request,
    ) {
        await this.authService.logout(req.user.id);

        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        return { message: 'user logged out' };
    }

    @Post('password/reset-email')
    @Public()
    async resetPasswordEmail(
        @Body(new ValidationPipe()) resetPasswordPayload: ResetPasswordEmailDto,
    ) {
        const { email } = resetPasswordPayload;

        await this.authService.sendResetPasswordEmail(email);

        return { message: 'reset password email sent' };
    }

    @Post('password/reset')
    @Public()
    async resetPassword(
        @Body(new ValidationPipe()) resetPasswordPayload: ResetPasswordDto,
    ) {
        const { token, newPassword } = resetPasswordPayload;

        await this.authService.resetPassword(token, newPassword);

        return { message: 'password was reset successfully' };
    }

    @Post('password/change')
    async changePassword(
        @Req() req: Request,
        @Body(new ValidationPipe()) payload: ChangePasswordDto,
    ) {
        const userId = req.user.id;
        await this.authService.changePassword(
            userId,
            payload.oldPassword,
            payload.newPassword,
        );
        return { message: 'password changed successfully' };
    }
}
