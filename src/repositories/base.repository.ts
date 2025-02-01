import { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export class BaseRepository<M> {
    public readonly tableName: string;
    protected readonly connectionPool: Pool;

    constructor(tableName: string, connectionPool: Pool) {
        this.tableName = tableName;
        this.connectionPool = connectionPool;
    }

    async select(
        selectors: string[],
        whereObj?: { where: string; values: any[] },
    ) {
        if (selectors.length === 0) {
            throw new Error('no selectors provided');
        }

        const sql = `SELECT ${selectors.join(',')} FROM ?? 
            ${whereObj ? `WHERE ${whereObj.where}` : ''}`;

        const values = [this.tableName, ...(whereObj?.values || [])];

        const [results] = await this.connectionPool.query<
            (M & RowDataPacket)[]
        >({ sql, values });

        return results;
    }

    async insert(data: Partial<M>) {
        const [results] = await this.connectionPool.query<ResultSetHeader>({
            sql: `INSERT INTO ?? SET ?`,
            values: [this.tableName, data],
        });

        return results;
    }

    async update(data: Partial<M>, whereObj: { where: string; values: any[] }) {
        if (!whereObj) {
            throw new Error('whereObj is required in update');
        }

        const sql = `UPDATE ?? SET ? WHERE ${whereObj.where}`;

        const values = [this.tableName, data, ...whereObj.values];

        const [results] = await this.connectionPool.query<ResultSetHeader>({
            sql,
            values,
        });

        return results;
    }
}
