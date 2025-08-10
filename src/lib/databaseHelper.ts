import { QueryConfig } from 'pg';
import {
    deleteQuery,
    executeQuery,
    insertQuery,
    selectOneQuery,
    selectQuery,
    updateQuery,
    upsertQuery,
} from './queries';

export class DatabaseHelper<T = Record<string, any>> {
    database: string;
    tableName?: string;
    constructor() {
        this.database = process.env.DB_NAME ?? '';
    }
    async execute<A = T>({ query }: { query: QueryConfig }) {
        return await executeQuery<A>(this.database, query);
    }

    async select<A = T>({
        query,
        selectParams,
        tableName = this?.tableName,
    }: {
        query?: QueryConfig;
        selectParams?: (keyof A)[];
        tableName?: string;
    }) {
        return await selectQuery<A>(this.database, tableName ?? '', query, selectParams);
    }

    async selectOne<A = T>({
        query,
        selectParams,
        tableName = this?.tableName,
    }: {
        query: QueryConfig;
        selectParams?: (keyof A)[];
        tableName?: string;
    }) {
        return await selectOneQuery<A>(this.database, tableName ?? '', query, selectParams);
    }

    async insert<A = T>({
        postObject,
        returnParams,
        tableName = this?.tableName,
    }: {
        postObject: A;
        returnParams?: (keyof A)[];
        tableName?: string;
    }) {
        return await insertQuery<A>(this.database, tableName ?? '', returnParams, postObject);
    }

    async update<A = T>({
        updateObject,
        query,
        returnParams,
        tableName = this?.tableName,
    }: {
        updateObject: A;
        query: QueryConfig;
        returnParams?: (keyof A)[];
        tableName?: string;
    }) {
        return await updateQuery<A>(
            this.database,
            tableName ?? '',
            query,
            updateObject,
            returnParams,
        );
    }

    async upsert<A = T>({
        postObject,
        updateObject,
        query,
        conflictColumn,
        returnParams,
        tableName = this?.tableName,
    }: {
        postObject: A;
        updateObject?: Partial<A>;
        query?: QueryConfig;
        conflictColumn: string;
        returnParams?: (keyof A)[];
        tableName?: string;
    }) {
        return await upsertQuery<A>(
            this.database,
            tableName ?? '',
            conflictColumn,
            postObject,
            updateObject ?? postObject,
            query,
            returnParams,
        );
    }

    async delete<A = T>({
        query,
        returnParams,
    }: {
        query?: QueryConfig;
        returnParams?: (keyof A)[];
    }) {
        return await deleteQuery<A>(this.database, this?.tableName ?? '', query, returnParams);
    }
}
