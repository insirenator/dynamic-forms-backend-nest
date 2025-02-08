import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Request, Response, NextFunction } from 'express';
import * as cookieParser from 'cookie-parser';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

const globalValidationPipe = new ValidationPipe({
    transform: true,
    exceptionFactory: (errors) => {
        const messages = errors.map((err) => ({
            field: err.property,
            errors: Object.values(err.constraints),
        }));
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
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.disable('x-powered-by');
    app.useGlobalPipes(globalValidationPipe);
    app.use(cookieParser());
    app.use(healthCheck);
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
