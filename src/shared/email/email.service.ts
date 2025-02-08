import { EmailConfiguration } from '@/config/email.config';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { TemplatesService } from './templates.service';
import { UtilsService } from '../utils/utils.service';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor(
        private emailConfig: EmailConfiguration,
        private templatesService: TemplatesService,
        private utilsService: UtilsService,
    ) {
        this.transporter = this.configureTransport();
    }

    private configureTransport() {
        const config = {
            service: this.emailConfig.appService,
            auth: {
                user: this.emailConfig.appEmail,
                pass: this.emailConfig.appPassword,
            },
        };
        return nodemailer.createTransport(config);
    }

    private async sendMail(mailOpts: nodemailer.SendMailOptions) {
        return this.transporter.sendMail(mailOpts).catch((error) => {
            console.error('Error while sending email!', error);
            throw new InternalServerErrorException('Internal Server Error');
        });
    }

    async sendSignUpVerificationEmail(data: {
        email: string;
        verifyToken: string;
    }) {
        const verifyLink = this.utilsService.createSignUpVerificationLink({
            token: data.verifyToken,
        });
        const html = this.templatesService.generateSignUpEmailTemplate({
            verifyLink,
        });

        const mail = new MailMessage()
            .to(data.email)
            .subject('Sign Up Verification')
            .html(html)
            .compileMessage();

        await this.sendMail(mail);
    }

    async sendResetPasswordEmail(data: {
        email: string;
        resetPasswordToken: string;
    }) {
        const resetPasswordLink =
            this.utilsService.createSignUpVerificationLink({
                token: data.resetPasswordToken,
            });
        const html = this.templatesService.generateResetPasswordEmailTemplate({
            resetPasswordLink,
        });

        const mail = new MailMessage()
            .to(data.email)
            .subject('Reset Password')
            .html(html)
            .compileMessage();

        await this.sendMail(mail);
    }
}

class MailMessage {
    private mailOpts: nodemailer.SendMailOptions = {};

    from(value: nodemailer.SendMailOptions['from']) {
        this.mailOpts['from'] = value;
        return this;
    }
    to(value: nodemailer.SendMailOptions['to']) {
        this.mailOpts['to'] = value;
        return this;
    }
    subject(value: nodemailer.SendMailOptions['subject']) {
        this.mailOpts['subject'] = value;
        return this;
    }
    html(value: nodemailer.SendMailOptions['html']) {
        this.mailOpts['html'] = value;
        return this;
    }
    cc(value: nodemailer.SendMailOptions['cc']) {
        this.mailOpts['cc'] = value;
        return this;
    }
    bcc(value: nodemailer.SendMailOptions['bcc']) {
        this.mailOpts['bcc'] = value;
        return this;
    }
    text(value: nodemailer.SendMailOptions['text']) {
        this.mailOpts['text'] = value;
        return this;
    }
    attachments(value: nodemailer.SendMailOptions['attachments']) {
        this.mailOpts['attachments'] = value;
        return this;
    }
    compileMessage() {
        return this.mailOpts;
    }
}
