import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { RepositoriesModule } from '@/repositories/repositories.module';
import { HasherService } from '@/shared/hasher.service';
import { JwtService } from '@/shared/jwt.service';

@Module({
    imports: [RepositoriesModule],
    controllers: [AuthController],
    providers: [AuthService, HasherService, JwtService],
    exports: [AuthService],
})
export class AuthModule {}
