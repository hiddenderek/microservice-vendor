import { type FieldValue } from '../field-cache/types';

export type ConditionType =
    | { field: string }
    | { operator: OperatorType }
    | { parentheses: ParenthesesType }
    | { logicalOperator: LogicalOperatorType }
    | { value: FieldValue };

export type ProcessedConditionType = ConditionType | { booleanResult: boolean };

export enum FieldType {
    String = 'string',
    Number = 'number',
    Date = 'date',
}

export enum OperatorType {
    Equals = '=',
    LessThan = '<',
    GreaterThan = '>',
    NotEquals = '!=',
    GreaterThanOrEqual = '>=',
    LessThanOrEqual = '<=',
    Includes = 'in',
    DoesntInclude = 'not-in',
    StartsWith = 'starts-with',
    EndsWith = 'ends-with',
    Matches = 'regex',
    Exists = 'exists',
    NotExists = 'not-exists',
    Before = 'before',
    After = 'after',
    OnOrBefore = 'on-or-before',
    OnOrAfter = 'on-or-after',
    DaysAfter = 'days-after',
    DaysBefore = 'days-before',
}

export enum ParenthesesType {
    OpenParentheses = '(',
    CloseParentheses = ')',
}

export enum LogicalOperatorType {
    And = 'and',
    Or = 'or',
}

export type Field = { value: FieldValue };
