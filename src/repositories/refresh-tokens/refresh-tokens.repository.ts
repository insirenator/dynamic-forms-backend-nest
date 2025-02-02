import { Injectable } from '@nestjs/common';
import { Pool } from 'mysql2/promise';
import { InjectClient } from 'nest-mysql';
import { BaseRepository } from '../base.repository';

interface RefreshTokenDto {
    user_id: number;
    token: string;
    created_at: Date;
}

@Injectable()
export class RefreshTokensRepository extends BaseRepository<RefreshTokenDto> {
    constructor(@InjectClient() connectionPool: Pool) {
        super('refresh_tokens', connectionPool);
    }

    async getByUserId(id: number) {
        const results = await this.select(['*'], {
            where: 'user_id = ?',
            values: [id],
        });
        return results[0];
    }

    async insertToken(user_id: number, token: string) {
        const results = await this.insert({ user_id, token });
        return results.insertId;
    }

    async deleteByUserId(user_id: number) {
        const results = await this.delete({
            where: 'user_id = ?',
            values: [user_id],
        });
        return results.affectedRows;
    }
}
