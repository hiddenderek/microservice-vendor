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
    }: {
        query?: QueryConfig;
        selectParams?: (keyof A)[];
    }) {
        return await selectQuery<A>(this.database, this?.tableName ?? '', query, selectParams);
    }

    async selectOne<A = T>({
        query,
        selectParams,
    }: {
        query: QueryConfig;
        selectParams?: (keyof A)[];
    }) {
        return await selectOneQuery<A>(this.database, this?.tableName ?? '', query, selectParams);
    }

    async insert<A = T>({
        postObject,
        returnParams,
    }: {
        postObject: A;
        returnParams?: (keyof A)[];
    }) {
        return await insertQuery<A>(this.database, this?.tableName ?? '', returnParams, postObject);
    }

    async update<A = T>({
        updateObject,
        query,
        returnParams,
    }: {
        updateObject: A;
        query: QueryConfig;
        returnParams?: (keyof A)[];
    }) {
        return await updateQuery<A>(
            this.database,
            this?.tableName ?? '',
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
    }: {
        postObject: A;
        updateObject: Partial<A>;
        query?: QueryConfig;
        conflictColumn: string;
        returnParams?: (keyof A)[];
    }) {
        return await upsertQuery<A>(
            this.database,
            this?.tableName ?? '',
            conflictColumn,
            postObject,
            updateObject,
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
