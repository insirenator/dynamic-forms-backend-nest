import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MysqlModule } from 'nest-mysql';
import { ConfigifyModule } from '@itgorillaz/configify';
import { DatabaseConfiguration } from './config/db.config';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { RequestLoggerMiddleware } from './app.middlewares';
import { QuestionBankModule } from './question-bank/question-bank.module';

@Module({
    imports: [
        ConfigifyModule.forRootAsync(),
        MysqlModule.forRootAsync({
            imports: [ConfigifyModule],
            useFactory: async (databaseConfig: DatabaseConfiguration) => ({
                host: databaseConfig.host,
                database: 'dynamic_forms',
                port: databaseConfig.port,
                user: databaseConfig.username,
                password: databaseConfig.password,
                pool: true,
            }),
            inject: [DatabaseConfiguration],
        }),
        AuthModule,
        QuestionBankModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
    ],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(RequestLoggerMiddleware).forRoutes('*');
    }
}
