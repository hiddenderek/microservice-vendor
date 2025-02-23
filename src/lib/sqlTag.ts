import { QueryConfig } from 'pg';
import * as sqlTag from './misc/sqlTemplateTag';

export const sql = sqlTag.default as unknown as (t: TemplateStringsArray, ...rest) => QueryConfig;
export const concatSql = (...values: (QueryConfig<any[]> | string | undefined)[]) => {
    const filteredValues = values.filter((value) => typeof value !== 'undefined');
    return sqlTag.join(filteredValues, ' ') as QueryConfig;
};
export const joinSql = (
    values: (QueryConfig<any[]> | string | undefined)[],
    separator: string = ' ',
    prefix?: string,
    suffix?: string,
) => {
    const filteredValues = values.filter((value) => typeof value !== 'undefined');
    return sqlTag.join(filteredValues, separator, prefix, suffix) as QueryConfig;
};
export const rawText = sqlTag.raw as unknown as (value: string) => any;
