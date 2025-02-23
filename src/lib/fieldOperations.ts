import { concatSql, joinSql, rawText, sql } from './sqlTag';

const isArray = function (a) {
    return Array.isArray(a);
};

const isObject = function (o) {
    return o === Object(o) && !isArray(o) && typeof o !== 'function';
};

const toCamel = (s) => {
    return s.replace(/([-_][a-z])/gi, ($1) => {
        return $1.toUpperCase().replace('-', '').replace('_', '');
    });
};

const toSnake = (s) => {
    return s.replace(/([a-z])([^a-z])/g, (m, c1, c2) => `${c1}_${c2.toLowerCase()}`);
};

export const keysToCamel = function (o) {
    if (isObject(o)) {
        const n = {};

        Object.keys(o).forEach((k) => {
            n[toCamel(k)] = keysToCamel(o[k]);
        });

        return n;
    } else if (isArray(o)) {
        return o.map((i) => {
            return keysToCamel(i);
        });
    }

    return o;
};

export const fields = function (o: Record<string, any>) {
    const fieldMap = new Map(Object.keys(o).map((k) => [k, toSnake(k)]));
    const fields = Array.from(fieldMap.values()).join(', ');
    return fields;
};

export const values = function (o: Record<string, any>) {
    const fieldMap = new Map(Object.keys(o).map((k) => [k, toSnake(k)]));
    const vals = Array.from(fieldMap.keys()).map((k) => sql`${o[k]}`);
    return joinSql(vals, ', ');
};

export const fieldsEqualValues = function <T>(o: T) {
    const fieldMap = new Map(Object.keys(o as Record<string, any>).map((k) => [k, toSnake(k)]));
    const vals = Array.from(fieldMap.entries())
        .filter((e) => o[e[0]] !== undefined)
        .map((e) => concatSql(rawText(`${e[1]} =`), sql`${o[e[0]]}`));
    return joinSql(vals, ', ');
};

export const fieldsAsCamel = function <T = string>(params: T[]) {
    const fieldMap = new Map(params.map((k) => [k, toSnake(k)]));
    const fieldsAsCamel = Array.from(fieldMap.entries())
        .map((e) => `${e[1]} AS "${e[0]}"`)
        .join(', ');

    return fieldsAsCamel;
};
