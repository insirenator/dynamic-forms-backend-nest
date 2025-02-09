import { Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

export class RequestLoggerMiddleware implements NestMiddleware {
    private readonly logger = new Logger('HTTPRequestLogger');

    use(req: Request, res: Response, next: NextFunction) {
        // Log the request when it is received
        this.logger.log(`(INCOMING) [${req.method}] ${req.originalUrl}`);

        // Add a listener to log the request when it finishes
        res.on('finish', () => {
            const statusCode = res.statusCode;
            const logMsg = `(OUTGOING) [${req.method}] ${req.url} - ${statusCode}`;

            if (statusCode >= 500) {
                this.logger.error(logMsg);
            } else if (statusCode >= 400) {
                this.logger.warn(logMsg);
            } else {
                this.logger.log(logMsg);
            }
        });

        next();
    }
}
