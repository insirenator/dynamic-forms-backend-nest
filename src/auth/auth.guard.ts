import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Reflector } from '@nestjs/core';
import { Public } from '@/shared/decorators/auth.decorators';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private authService: AuthService,
    ) {}

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const isPublic = this.reflector.get(Public, context.getHandler());
        if (isPublic) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        return this.authoriseRequest(request, response);
    }

    async authoriseRequest(request: Request, response: Response) {
        try {
            const accessToken = request.cookies['accessToken'];

            const { newAccessToken, user_id } =
                await this.authService.validateOrSignAccessToken(accessToken);

            if (newAccessToken) {
                response.cookie('accessToken', newAccessToken, {
                    httpOnly: true,
                    sameSite: 'strict',
                });
            }

            const userDetails =
                await this.authService.getUserDetailsById(user_id);
            response.locals.user = userDetails;

            return true;
        } catch (error) {
            response.status(401).json({ message: error.message });
            return false;
        }
    }
}
