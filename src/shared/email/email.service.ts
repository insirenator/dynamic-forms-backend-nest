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

    async sendSignUpVerificationEmail(data: {
        email: string;
        verifyToken: string;
    }) {
        const mail = new MailMessage()
            .to(data.email)
            .subject('Sign Up Verification')
            .html(
                this.templatesService.generateSignUpEmailTemplate({
                    verifyToken: data.verifyToken,
                }),
            )
            .compileMessage();

        await this.transporter.sendMail(mail);
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
