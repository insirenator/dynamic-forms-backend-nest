import { Injectable } from '@nestjs/common';
import { Pool } from 'mysql2/promise';
import { InjectClient } from 'nest-mysql';

@Injectable()
export class UsersRepository {
    public readonly tableName = 'users';
    constructor(@InjectClient() private readonly connectionPool: Pool) {}

    async getAll() {
        const conn = await this.connectionPool.getConnection();
        const data = await conn.query('SELECT * FROM users');
        conn.release();
        console.log(data);
        return [];
    }
}
