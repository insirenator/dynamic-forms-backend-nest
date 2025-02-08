import { JwtConfiguration } from '@/config/jwt.config';
import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
    /** Token actions to identify for which action, the token was issued */
    tokenActions = {
        /** Access Token Action */
        ACCT: 'ACCT',
        /** Refresh Token Action */
        REFT: 'REFT',
        /** Sign Up Verification Token Action */
        SGNT: 'SGNT',
        /** Password Reset Token Action */
        PWDT: 'PWDT',
    };

    constructor(private jwtConfig: JwtConfiguration) {}

    signAccessToken(payload: { id: number }) {
        return jwt.sign(payload, this.jwtConfig.jwtSecret, {
            expiresIn: '12h',
        });
    }

    signRefreshToken(payload: { id: number }) {
        return jwt.sign(payload, this.jwtConfig.jwtSecret, { expiresIn: '7d' });
    }

    signVerificationToken(payload: { id: number }) {
        return jwt.sign(payload, this.jwtConfig.jwtSecret, {
            expiresIn: '24h',
        });
    }

    signResetPasswordToken(payload: { id: number }) {
        return jwt.sign(payload, this.jwtConfig.jwtSecret, {
            expiresIn: '1h',
        });
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
            const decoded = jwt.decode(token);
            return [decoded, error];
        }
    }

    decodeToken(token: string) {
        return jwt.decode(token);
    }
}
