import { Injectable } from '@nestjs/common';
import { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { InjectClient } from 'nest-mysql';

interface RefreshTokenRow extends RowDataPacket {
    user_id: number;
    token: string;
    created_at: Date;
}

@Injectable()
export class RefreshTokensRepository {
    public readonly tableName = 'refresh_tokens';
    constructor(@InjectClient() private readonly connectionPool: Pool) {}

    async getByUserId(id: number) {
        const [result] = await this.connectionPool.query<RefreshTokenRow[]>({
            sql: `SELECT * FROM ?? WHERE user_id = ?`,
            values: [this.tableName, id],
        });

        return result[0];
    }

    async insert(user_id: number, token: string) {
        const [result] = await this.connectionPool.query<ResultSetHeader>({
            sql: `INSERT INTO ?? SET ?`,
            values: [this.tableName, { user_id, token }],
        });

        return result.insertId;
    }

    async deleteByUserId(user_id: number) {
        const [result] = await this.connectionPool.query<ResultSetHeader>({
            sql: `DELETE FROM ?? WHERE user_id = ?`,
            values: [this.tableName, user_id],
        });

        return result.affectedRows;
    }
}
