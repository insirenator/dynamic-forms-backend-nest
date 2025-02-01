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

    generateSignUpEmailTemplate(data: { verifyToken: string }) {
        return this.wrapInLayout(`
            <h2 class="title">Sign Up Verification</h2>
            <p>Here is your signup token: ${data.verifyToken}</p>
        `);
    }
}
