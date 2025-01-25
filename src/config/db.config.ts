import { Configuration, Value } from '@itgorillaz/configify';

@Configuration()
export class DatabaseConfiguration {
    @Value('DB_HOST')
    host: string;

    @Value('DB_PORT', {
        parse: parseInt,
    })
    port: number;

    @Value('DB_USERNAME')
    username: string;

    @Value('DB_PASSWORD')
    password: string;
}
