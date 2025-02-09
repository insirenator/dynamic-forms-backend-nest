import { WinstonModule } from 'nest-winston';
import { format, transports } from 'winston';
import 'winston-daily-rotate-file';

const errorTransport = new transports.DailyRotateFile({
    filename: 'logs/%DATE%-errors.log', // %DATE% will be replaced by datePattern
    level: 'error',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: false, // do not archive logs
    maxFiles: '30d', // keep files till they are thirty days old
    format: format.combine(
        format.errors({ stack: true }),
        format.timestamp(),
        format.json(),
    ),
});

const combinedTransport = new transports.DailyRotateFile({
    filename: 'logs/%DATE%-combined.log', // %DATE% will be replaced by datePattern
    datePattern: 'YYYY-MM-DD',
    zippedArchive: false, // do not archive logs
    maxFiles: '30d', // keep files till they are thirty days old
    format: format.combine(
        format.errors({ stack: true }),
        format.timestamp(),
        format.json(),
    ),
});

const cliTransport = new transports.Console({
    format: format.combine(
        format.errors({ stack: true }),
        format.cli(),
        format.splat(),
        format.timestamp({ format: 'YYYY-MM-DD hh:mm:ss.SSS A' }),
        format.printf(
            (info) =>
                `${info.timestamp} [${info.level}]: ${info.message} ${info.stack ? '\n' + info.stack : ''}`,
        ),
    ),
});

export const appLogger = WinstonModule.createLogger({
    transports: [errorTransport, combinedTransport, cliTransport],
});
