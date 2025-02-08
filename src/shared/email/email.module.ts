import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { TemplatesService } from './templates.service';
import { UtilsModule } from '../utils/utils.module';

@Module({
    imports: [UtilsModule],
    providers: [EmailService, TemplatesService],
    exports: [EmailService],
})
export class EmailModule {}
