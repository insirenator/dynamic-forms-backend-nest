import { Injectable } from '@nestjs/common';

@Injectable()
export class TemplatesService {
    wrapInLayout(body: string) {
        const styles = `
        <style>
            .title {
                color: blue;
            }
        </style>
        `;
        return `<!DOCTYPE html><html><head>${styles}</head><body>${body}</body><html>`;
    }

    generateSignUpEmailTemplate(data: { verifyLink: string }) {
        return this.wrapInLayout(`
            <h2 class="title">Sign Up Verification</h2>
            <p>Here is your signup Link: ${data.verifyLink}</p>
            <p>This link is only valid for 24 hours</p>
        `);
    }

    generateResetPasswordEmailTemplate(data: { resetPasswordLink: string }) {
        return this.wrapInLayout(`
            <h2 class="title">Reset Password</h2>
            <p>Follow this link to reset your password: ${data.resetPasswordLink}</p>
            <p>This link is only valid for 1 hour</p>
        `);
    }
}
