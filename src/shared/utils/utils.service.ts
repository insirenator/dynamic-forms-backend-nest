import { ClientAppConfiguration } from '@/config/client-app.config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilsService {
    constructor(private clientAppConfig: ClientAppConfiguration) {}

    createSignUpVerificationLink({ token }: { token: string }) {
        const link = new URL(this.clientAppConfig.signupVerifyCallback);
        link.searchParams.set('token', token);
        return link.toString();
    }

    createResetPasswordLink({ token }: { token: string }) {
        const link = new URL(this.clientAppConfig.resetPasswordCallback);
        link.searchParams.set('token', token);
        return link.toString();
    }

    createLimitAndOffset(limit: number, page: number) {
        return {
            limit,
            offset: (page - 1) * limit,
        };
    }
}
