import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Request, Response, NextFunction } from 'express';
import * as cookieParser from 'cookie-parser';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { appLogger } from './app.logger';
import { ValidationError } from 'class-validator';

const sanitizeErrors = (errors: ValidationError[]) => {
    const messages = errors.map((err) => ({
        field: err.property,
        errors: err.constraints ? Object.values(err.constraints) : undefined,
        children: err?.children.length
            ? sanitizeErrors(err.children)
            : undefined,
    }));

    return messages;
};

const globalValidationPipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false,
    transform: true,
    exceptionFactory: (errors) => {
        const messages = sanitizeErrors(errors);
        return new BadRequestException({
            statusCode: 400,
            message: 'Validation Failed!',
            errors: messages,
        });
    },
});

async function healthCheck(req: Request, res: Response, next: NextFunction) {
    if (req.url !== '/health') return next();

    return res.status(200).send();
}

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        logger: appLogger,
    });
    app.disable('x-powered-by');
    app.useGlobalPipes(globalValidationPipe);
    app.use(cookieParser());
    app.use(healthCheck);
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
