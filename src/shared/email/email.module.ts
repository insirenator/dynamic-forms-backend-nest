import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { TemplatesService } from './templates.service';

@Module({
    providers: [EmailService, TemplatesService],
    exports: [EmailService],
})
export class EmailModule {}
