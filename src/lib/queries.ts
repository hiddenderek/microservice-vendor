import { QueryConfig } from 'pg';
import { getConnection } from './getConnection';
import { fields, fieldsAsCamel, fieldsEqualValues, keysToCamel, values } from './fieldOperations';
import { concatSql, rawText, sql } from './sqlTag';
import { InternalServerErrorException } from '@nestjs/common';

export const executeQuery = async <T>(db: string, query: QueryConfig): Promise<T[]> => {
    const { pool, poolClient } = await getConnection(db);
    try {
        const result = (await poolClient.query<T[]>(query)) ?? [];
        pool.end();
        return result.rows.map((r) => keysToCamel(r));
    } catch (e) {
        pool.end();
        throw new InternalServerErrorException(e, 'Database Error');
    }
};

export const selectQuery = async <T>(
    db: string,
    tableName: string,
    query?: QueryConfig | undefined,
    selectParams?: (keyof T)[],
    ...o: T[]
): Promise<T[]> => {
    const selectQuery = concatSql(
        rawText(
            `SELECT ${selectParams?.length ? fieldsAsCamel(selectParams) : '*'} FROM ${tableName}`,
        ),
        query,
    );
    return (await executeQuery(db, selectQuery)) ?? [];
};

export const selectOneQuery = async <T>(
    db: string,
    tableName: string,
    query: QueryConfig,
    selectParams?: (keyof T)[],
): Promise<T | null> => {
    const selectQuery = concatSql(
        rawText(
            `SELECT ${selectParams?.length ? fieldsAsCamel(selectParams) : '*'} FROM ${tableName}`,
        ),
        query,
    );
    const result = await executeQuery<T>(db, selectQuery);
    if (result.length === 1) {
        return result[0];
    }
    return null;
};

export const insertQuery = async <T>(
    db: string,
    tableName: string,
    returnParams?: (keyof T)[],
    ...o: T[]
): Promise<T | null> => {
    const fieldsString = fields(o[0] as Record<string, any>);
    const insertQuery = concatSql(
        rawText(`INSERT INTO ${tableName} (${fieldsString}) VALUES`),
        ...o.map((obj, i, arr) =>
            concatSql(
                rawText(`(`),
                values(obj as Record<string, any>),
                i < arr.length - 1 ? rawText('),') : rawText(')'),
            ),
        ),
        rawText(`RETURNING ${returnParams?.length ? fieldsAsCamel(returnParams) : '*'}`),
    );
    const result = await executeQuery<T>(db, insertQuery);
    if (result.length === 1) {
        return result[0];
    }
    return null;
};

export const updateQuery = async <T>(
    db: string,
    tableName: string,
    query: QueryConfig,
    o: T,
    returnParams?: (keyof T)[],
): Promise<T | null> => {
    const insertQuery = concatSql(
        rawText(`UPDATE ${tableName} SET`),
        fieldsEqualValues<T>(o),
        query,
        rawText(`RETURNING ${returnParams?.length ? fieldsAsCamel(returnParams) : '*'}`),
    );
    const result = await executeQuery<T>(db, insertQuery);
    if (result.length === 1) {
        return result[0];
    }
    return null;
};

export const upsertQuery = async <T>(
    db: string,
    tableName: string,
    conflictColumn: string,
    o1: T,
    o2: Partial<T>,
    query?: QueryConfig,
    returnParams?: (keyof T)[],
): Promise<T | null> => {
    const fieldsString = fields(o1 as Record<string, any>);
    const insertQuery = concatSql(
        rawText(`INSERT INTO ${tableName} (${fieldsString}) VALUES`),
        rawText(`(`),
        values(o1 as Record<string, any>),
        rawText(')'),
        rawText(`ON CONFLICT (${conflictColumn}) DO UPDATE SET`),
        fieldsEqualValues(o2),
        query,
        rawText(`RETURNING ${returnParams?.length ? fieldsAsCamel(returnParams) : '*'}`),
    );
    const result = await executeQuery<T>(db, insertQuery);
    if (result.length === 1) {
        return result[0];
    }
    return null;
};

export const deleteQuery = async <T>(
    db: string,
    tableName: string,
    query?: QueryConfig | undefined,
    returnParams?: (keyof T)[],
): Promise<T[]> => {
    const deleteQuery = concatSql(
        rawText(
            `DELETE FROM ${tableName}`,
        ),
        query,
        rawText(
            `RETURNING ${returnParams?.length ? fieldsAsCamel(returnParams) : '*'}`
        )
    );
    return (await executeQuery(db, deleteQuery)) ?? [];
};