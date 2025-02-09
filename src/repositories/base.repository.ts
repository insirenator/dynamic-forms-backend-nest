import { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';

type WhereObjType = {
    where: string;
    values: any[];
};

export class BaseRepository<M> {
    public readonly tableName: string;
    protected readonly connectionPool: Pool;

    constructor(tableName: string, connectionPool: Pool) {
        this.tableName = tableName;
        this.connectionPool = connectionPool;
    }

    select(selectors: string[], whereObj?: WhereObjType) {
        return this.selectFromTable(this.tableName, selectors, whereObj);
    }

    async selectFromTable(
        tableName: string,
        selectors: string[],
        whereObj?: WhereObjType,
    ) {
        if (selectors.length === 0) {
            throw new Error('no selectors provided');
        }

        const sql = `SELECT ${selectors.join(',')} FROM ?? 
            ${whereObj ? `WHERE ${whereObj.where}` : ''}`;

        const values = [tableName, ...(whereObj?.values || [])];

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

    async update(data: Partial<M>, whereObj: WhereObjType) {
        this.validateWhereObj(whereObj);

        const sql = `UPDATE ?? SET ? WHERE ${whereObj.where}`;

        const values = [this.tableName, data, ...whereObj.values];

        const [results] = await this.connectionPool.query<ResultSetHeader>({
            sql,
            values,
        });

        return results;
    }

    async delete(whereObj: WhereObjType) {
        this.validateWhereObj(whereObj);

        const sql = `DELETE FROM ?? WHERE ${whereObj.where}`;
        const values = [this.tableName, ...whereObj.values];

        const [results] = await this.connectionPool.query<ResultSetHeader>({
            sql,
            values,
        });

        return results;
    }

    private validateWhereObj(whereObj: WhereObjType) {
        if (!whereObj) {
            throw new Error('whereObj is required!');
        }

        if (!whereObj.where) {
            throw new Error('whereObj.where is required!');
        }

        if (!whereObj.values?.length) {
            throw new Error('whereObj.values is required!');
        }
    }
}
