import { Configuration, Value } from '@itgorillaz/configify';

@Configuration()
export class JwtConfiguration {
    @Value('JWT_SECRET')
    jwtSecret: string;

    @Value('AT_EXP')
    aTExpiry: string;

    @Value('RT_EXP')
    rTExpiry: string;
}
