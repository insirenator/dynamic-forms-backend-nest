import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { LoginDto, SignUpDto } from './auth.dto';
import { JwtService } from '@/shared/jwt.service';
import { RefreshTokensRepository } from '@/repositories/refresh-tokens/refresh-tokens.repository';
import { EmailService } from '@/shared/email/email.service';
import { UsersRepository } from '@/repositories/users/users.repository';
import { HasherService } from '@/shared/hasher.service';

@Injectable()
export class AuthService {
    constructor(
        private usersRepository: UsersRepository,
        private refreshTokensRepository: RefreshTokensRepository,
        private hasher: HasherService,
        private jwtService: JwtService,
        private emailService: EmailService,
    ) {}

    async signup(signupPayload: SignUpDto) {
        signupPayload.password = await this.hasher.hash(signupPayload.password);
        const userId = await this.usersRepository.insertUser(signupPayload);
        await this.sendVerificationEmail(userId);
    }

    async sendVerificationEmail(userId: number) {
        const verifyToken = this.jwtService.signVerificationToken({
            id: userId,
        });

        const user = await this.usersRepository.getUserById(userId);

        await this.emailService.sendSignUpVerificationEmail({
            verifyToken,
            email: user.email,
        });
        return verifyToken;
    }

    async resendVerificationEmail(userId: number) {
        const user = await this.usersRepository.getUserById(userId);

        if (!user) {
            throw new NotFoundException(
                `user with id '${userId}' doesn't exist`,
            );
        }

        if (user.verified === 1) {
            throw new BadRequestException(
                `user with id '${userId}' is already verified`,
            );
        }

        await this.sendVerificationEmail(userId);
    }

    async verifySignUp(verifyToken: string) {
        const [decoded, error] = this.jwtService.verifyToken(verifyToken);

        if (error) {
            switch (error.name) {
                case 'TokenExpiredError':
                    throw new BadRequestException('verification token expired');
                case 'JsonWebTokenError':
                    throw new BadRequestException('invalid verification token');
                default:
                    throw new BadRequestException(error.message);
            }
        }

        await this.usersRepository.verifyUserById(decoded.id);
    }

    async login(credentials: LoginDto) {
        const { email, password } = credentials;

        const user = await this.usersRepository.getUserByEmail(email);

        if (!user) {
            throw new BadRequestException(
                `user with email '${email}' does not exist.`,
            );
        }

        // If user is not verified yet
        if (user.verified === 0) {
            throw new ForbiddenException({
                message: `user is not verified`,
                user_id: user.id,
            });
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
            throw new BadRequestException('incorrect password');
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
        if (!accessToken) {
            throw new Error('no access token provided');
        }
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

    async logout(userId: number) {
        await this.refreshTokensRepository.deleteByUserId(userId);
    }

    async changePassword(
        userId: number,
        oldPassword: string,
        newPassword: string,
    ) {
        const user = await this.usersRepository.getUserById(userId);

        const isPasswordMatch = await this.hasher.compare(
            oldPassword,
            user.password,
        );

        if (!isPasswordMatch) {
            throw new BadRequestException('incorrect old password');
        }

        newPassword = await this.hasher.hash(newPassword);

        await this.usersRepository.update(
            { password: newPassword },
            { where: 'id = ?', values: [userId] },
        );
    }
}
