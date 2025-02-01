import { Injectable } from '@nestjs/common';
import { Pool } from 'mysql2/promise';
import { InjectClient } from 'nest-mysql';
import { UserDto } from './users.dto';
import { BaseRepository } from '../base.repository';

@Injectable()
export class UsersRepository extends BaseRepository<UserDto> {
    constructor(@InjectClient() connectionPool: Pool) {
        super('users', connectionPool);
    }

    async insertUser(user: Partial<UserDto>) {
        const result = await this.insert(user);
        return result.insertId;
    }

    async getUserByEmail(email: string): Promise<UserDto> {
        const results = await this.select(['*'], {
            where: 'email = ?',
            values: [email],
        });
        return results[0];
    }

    async verifyUserById(id: number) {
        const results = await this.update(
            { verified: 1 },
            { where: 'id = ?', values: [id] },
        );
        return results.affectedRows;
    }

    async getUserById(id: number): Promise<UserDto> {
        const results = await this.select(['*'], {
            where: 'id = ?',
            values: [id],
        });
        return results[0];
    }
}
