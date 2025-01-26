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

    async getAll() {
        return await this.usersRepository.getAll();
    }

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
}
