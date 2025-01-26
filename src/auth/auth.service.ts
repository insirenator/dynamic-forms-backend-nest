import { CreateUserDto } from '@/repositories/users/users.dto';
import { UsersRepository } from '@/repositories/users/users.repository';
import { HasherService } from '@/shared/hasher.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoginDto } from './auth.dto';
import { JwtService } from '@/shared/jwt.service';
import { RefreshTokensRepository } from '@/repositories/refresh-tokens/refresh-tokens.repository';

@Injectable()
export class AuthService {
    constructor(
        private usersRepository: UsersRepository,
        private refreshTokensRepository: RefreshTokensRepository,
        private hasher: HasherService,
        private jwtService: JwtService,
    ) {}

    async signup(signupPayload: CreateUserDto) {
        signupPayload.password = await this.hasher.hash(signupPayload.password);
        return await this.usersRepository.insertUser(signupPayload);
    }

    async login(credentials: LoginDto) {
        const { email, password } = credentials;

        const user = await this.usersRepository.getUserByEmail(email);

        if (!user) {
            throw new HttpException(
                `user with email '${email}' does not exist.`,
                HttpStatus.BAD_REQUEST,
            );
        }

        // Check for already stored refresh token
        const storedRefreshToken =
            await this.refreshTokensRepository.getByUserId(user.id);

        // If refresh token is already stored (meaning user had logged in before)
        if (storedRefreshToken) {
            const [, error] = this.jwtService.verifyToken(
                storedRefreshToken.token,
            );

            // Stored refresh token is valid
            if (!error) {
                // sign new access token and return it
                return {
                    accessToken: this.jwtService.signAccessToken({
                        id: user.id,
                    }),
                    refreshToken: storedRefreshToken.token,
                };
            }

            // If stored refresh token is invalid, delete it and allow the login flow to continue
            await this.refreshTokensRepository.deleteByUserId(user.id);
        }

        const isPasswordMatch = await this.hasher.compare(
            password,
            user.password,
        );

        if (!isPasswordMatch) {
            throw new HttpException(
                'incorrect password',
                HttpStatus.BAD_REQUEST,
            );
        }

        const signedTokens = this.jwtService.signTokens({ id: user.id });

        await this.refreshTokensRepository.insert(
            user.id,
            signedTokens.refreshToken,
        );

        return signedTokens;
    }

    /**
     * This method takes the access token and checks the following scenarios:
     * 1. whether the access token in valid
     * 2. Is there a valid refresh stored in db against the user whose access token it is
     * */
    async validateOrSignAccessToken(accessToken: string) {
        // Verify/Decode the access token
        const [aTDecoded, aTError] = this.jwtService.verifyToken(accessToken);

        // Fetch the refresh token corresponding to it
        const storedRefreshToken =
            await this.refreshTokensRepository.getByUserId(aTDecoded.id);

        // If no stored refresh token
        if (!storedRefreshToken) {
            throw new Error('no refresh token in db');
        }

        // Verify refresh token
        const [, rTError] = this.jwtService.verifyToken(
            storedRefreshToken.token,
        );

        // If refresh token expired
        if (rTError) {
            throw new Error('refresh token expired');
        }

        // If refresh token is valid but access token is expired,
        // sign a new access token and return it
        if (aTError) {
            return {
                newAccessToken: this.jwtService.signAccessToken({
                    id: aTDecoded.id,
                }),
                user_id: aTDecoded.id,
            };
        }

        return { newAccessToken: null, user_id: aTDecoded.id };
    }

    async getUserDetailsById(id: number) {
        return this.usersRepository.getUserById(id);
    }
}
