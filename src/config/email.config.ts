import { Configuration, Value } from '@itgorillaz/configify';

@Configuration()
export class EmailConfiguration {
    @Value('GMAIL_APP_EMAIL')
    appEmail: string;

    @Value('GMAIL_APP_PASSWORD')
    appPassword: string;

    appService: string = 'gmail';
}
