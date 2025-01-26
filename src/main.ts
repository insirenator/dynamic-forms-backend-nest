import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Request, Response, NextFunction } from 'express';
import * as cookieParser from 'cookie-parser';

async function healthCheck(req: Request, res: Response, next: NextFunction) {
    if (req.url !== '/health') return next();

    return res.status(200).send();
}

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.disable('x-powered-by');
    app.use(cookieParser());
    app.use(healthCheck);
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
