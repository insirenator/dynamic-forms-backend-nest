import { JwtConfiguration } from '@/config/jwt.config';
import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
    constructor(private jwtConfig: JwtConfiguration) {}

    signAccessToken(payload: { id: number }) {
        return jwt.sign(payload, this.jwtConfig.jwtSecret, { expiresIn: '1m' });
    }

    signRefreshToken(payload: { id: number }) {
        return jwt.sign(payload, this.jwtConfig.jwtSecret, { expiresIn: '1m' });
    }

    signTokens(payload: { id: number }) {
        return {
            accessToken: this.signAccessToken(payload),
            refreshToken: this.signRefreshToken(payload),
        };
    }

    verifyToken(token: string) {
        try {
            const decoded = jwt.verify(token, this.jwtConfig.jwtSecret);
            return [decoded, null];
        } catch (error) {
            return [null, error];
        }
    }

    decodeToken(token: string) {
        return jwt.decode(token);
    }
}
