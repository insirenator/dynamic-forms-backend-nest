import { Configuration, Value } from '@itgorillaz/configify';
import { IsUrl } from 'class-validator';

@Configuration()
export class ClientAppConfiguration {
    @IsUrl({ require_tld: false }) // require_tld = false allows localhost url to pass through
    @Value('CLIENT_BASE_URL')
    clientBaseUrl: string;

    @IsUrl({ require_tld: false })
    @Value('SIGNUP_VERIFY_CALLBACK')
    signupVerifyCallback: string;

    @IsUrl({ require_tld: false })
    @Value('RESET_PASSWORD_CALLBACK')
    resetPasswordCallback: string;
}
