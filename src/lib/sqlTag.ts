import { QueryConfig } from 'pg';
import * as sqlTag from './misc/sqlTemplateTag';

export const sql = sqlTag.default as unknown as (t: TemplateStringsArray, ...rest) => QueryConfig;

export const concatSql = (...values: (QueryConfig<any[]> | string | undefined)[]) => {
    const filteredValues = values
        .filter((value) => typeof value !== 'undefined')
        .map((value) => (typeof value === 'string' ? sqlTag.raw(value) : value));

    const joinedTags = sqlTag.join(filteredValues, ' ') as QueryConfig;

    return joinedTags;
};
export const joinSql = (
    values: (QueryConfig<any[]> | string | undefined)[],
    separator: string = ' ',
    prefix?: string,
    suffix?: string,
) => {
    const filteredValues = values
        .filter((value) => typeof value !== 'undefined')
        .map((value) => (typeof value === 'string' ? sqlTag.raw(value) : value));

    const joinedTags = sqlTag.join(filteredValues, separator, prefix, suffix) as QueryConfig;

    return joinedTags;
};
export const rawText = sqlTag.raw as unknown as (value: string) => any;
