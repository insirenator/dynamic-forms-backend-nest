import { UsersRepository } from '@/repositories/users/users.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
    constructor(private usersRepository: UsersRepository) {}

    async getAll() {
        return await this.usersRepository.getAll();
    }
}
