import { Injectable } from '@nestjs/common';
import { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { InjectClient } from 'nest-mysql';
import { CreateUserDto, UserDto } from './users.dto';

@Injectable()
export class UsersRepository {
    public readonly tableName = 'users';
    constructor(@InjectClient() private readonly connectionPool: Pool) {}

    async insertUser(user: CreateUserDto) {
        const [result] = await this.connectionPool.query<ResultSetHeader>({
            sql: `INSERT into ?? SET ?`,
            values: [this.tableName, user],
        });
        return result.insertId;
    }

    async getUserByEmail(email: string): Promise<UserDto> {
        const [result] = await this.connectionPool.query<
            (UserDto & RowDataPacket)[]
        >({
            sql: `SELECT * FROM ?? WHERE email = ?`,
            values: [this.tableName, email],
        });

        return result[0];
    }

    async getUserById(id: number): Promise<UserDto> {
        const [result] = await this.connectionPool.query<
            (UserDto & RowDataPacket)[]
        >({
            sql: `SELECT * FROM ?? WHERE id = ?`,
            values: [this.tableName, id],
        });

        return result[0];
    }
}
