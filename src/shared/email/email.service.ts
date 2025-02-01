import { EmailConfiguration } from '@/config/email.config';
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { TemplatesService } from './templates.service';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor(
        private emailConfig: EmailConfiguration,
        private templatesService: TemplatesService,
    ) {
        this.transporter = this.configureTransport();
    }

    configureTransport() {
        const config = {
            service: this.emailConfig.appService,
            auth: {
                user: this.emailConfig.appEmail,
                pass: this.emailConfig.appPassword,
            },
        };
        return nodemailer.createTransport(config);
    }

    async sendSignUpVerificationEmail(data: {
        email: string;
        verifyToken: string;
    }) {
        const message = {
            from: this.emailConfig.appEmail,
            to: data.email,
            subject: 'Sign Up Verification',
            html: this.templatesService.generateSignUpEmailTemplate({
                verifyToken: data.verifyToken,
            }),
        };

        await this.transporter.sendMail(message);
    }
}
