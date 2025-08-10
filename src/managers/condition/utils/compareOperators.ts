import { differenceInDays, isValid } from 'date-fns';
import { Field, OperatorType } from '../types';

export function evaluateOperator(
    { ...previousField }: Field,
    currentOperator: OperatorType,
    { ...currentField }: Field,
): boolean {
    const previousFieldDate = new Date(previousField.value);

    if (typeof previousField.value === 'string' && isValid(previousFieldDate)) {
        previousField.value = previousFieldDate;
    }

    const currentFieldDate = new Date(currentField.value);

    if (typeof previousField.value === 'string' && isValid(currentFieldDate)) {
        currentField.value = currentFieldDate;
    }

    canCompareFields(previousField, currentField, currentOperator);

    switch (currentOperator) {
        case OperatorType.Equals: {
            return previousField.value === currentField.value;
        }
        case OperatorType.LessThan: {
            return previousField.value < currentField.value;
        }
        case OperatorType.GreaterThan: {
            return previousField.value > currentField.value;
        }
        case OperatorType.NotEquals: {
            return previousField.value !== currentField.value;
        }
        case OperatorType.LessThanOrEqual: {
            return previousField.value <= currentField.value;
        }
        case OperatorType.GreaterThanOrEqual: {
            return previousField.value >= currentField.value;
        }
        case OperatorType.Includes: {
            if (typeof currentField.value === 'string' && typeof previousField.value === 'string') {
                return currentField.value.includes(previousField.value);
            }
            return false;
        }
        case OperatorType.DoesntInclude: {
            if (typeof currentField.value === 'string' && typeof previousField.value === 'string') {
                return !currentField.value.includes(previousField.value);
            }
            return true;
        }
        case OperatorType.StartsWith: {
            return String(previousField.value).startsWith(String(currentField.value));
        }
        case OperatorType.EndsWith: {
            return String(previousField.value).endsWith(String(currentField.value));
        }
        case OperatorType.Matches: {
            const regex = new RegExp(String(currentField.value));
            return regex.test(String(previousField.value));
        }
        case OperatorType.Exists: {
            return previousField.value !== undefined && previousField.value !== null;
        }
        case OperatorType.NotExists: {
            return previousField.value === undefined || previousField.value === null;
        }
        case OperatorType.Before: {
            const prevDate = new Date(previousField.value);
            const currDate = new Date(currentField.value);
            return prevDate < currDate;
        }
        case OperatorType.After: {
            const prevDate = new Date(previousField.value);
            const currDate = new Date(currentField.value);
            return prevDate > currDate;
        }
        case OperatorType.OnOrBefore: {
            const prevDate = new Date(previousField.value);
            const currDate = new Date(currentField.value);
            return prevDate <= currDate;
        }
        case OperatorType.OnOrAfter: {
            const prevDate = new Date(previousField.value);
            const currDate = new Date(currentField.value);
            return prevDate >= currDate;
        }
        case OperatorType.DaysAfter: {
            const currDate = new Date(currentField.value);

            if (!isValid(currDate)) {
                throw new Error('Invalid date value for BeforeByDays operator');
            }

            if (typeof previousField.value !== 'number') {
                throw new Error('Invalid date value for BeforeByDays operator');
            }

            const daysDiff = differenceInDays(new Date(), currDate);

            return daysDiff === previousField.value;
        }
        case OperatorType.DaysBefore: {
            const currDate = new Date(currentField.value);

            if (!isValid(currDate)) {
                throw new Error('Invalid date value for AfterByDays operator');
            }

            if (typeof previousField.value !== 'number') {
                throw new Error('Invalid date value for AfterByDays operator');
            }

            const daysDiff = differenceInDays(currDate, new Date());

            return daysDiff === previousField.value;
        }
        default:
            throw new Error(`Unsupported operator: ${currentOperator}`);
    }
}

function canCompareFields(previousField: Field, currentField: Field, operator: OperatorType) {
    const nonMatchingOperators = [OperatorType.DaysAfter, OperatorType.DaysBefore];

    if (
        typeof previousField.value !== typeof currentField.value &&
        !nonMatchingOperators.includes(operator)
    ) {
        throw new Error(
            `Field types do not match: ${typeof previousField.value} vs ${typeof currentField.value}`,
        );
    }

    if (typeof previousField.value === 'string') {
        const invalidStringOperators = [
            OperatorType.LessThan,
            OperatorType.GreaterThan,
            OperatorType.LessThanOrEqual,
            OperatorType.GreaterThanOrEqual,
            OperatorType.Before,
            OperatorType.After,
            OperatorType.OnOrBefore,
            OperatorType.OnOrAfter,
            OperatorType.DaysAfter,
            OperatorType.DaysBefore,
        ];

        if (invalidStringOperators.includes(operator)) {
            throw new Error(
                `Cannot use mathematical or date operator ${operator} on string fields`,
            );
        }
    }

    if (typeof previousField.value === 'number') {
        const invalidNumberOperators = [
            OperatorType.StartsWith,
            OperatorType.EndsWith,
            OperatorType.Matches,
            OperatorType.Includes,
            OperatorType.DoesntInclude,
            OperatorType.Before,
            OperatorType.After,
            OperatorType.OnOrBefore,
            OperatorType.OnOrAfter,
        ];

        if (invalidNumberOperators.includes(operator)) {
            throw new Error(`Cannot use string or date operator ${operator} on numeric fields`);
        }
    }

    if (previousField.value instanceof Date) {
        const invalidDateOperators = [
            OperatorType.StartsWith,
            OperatorType.EndsWith,
            OperatorType.Matches,
            OperatorType.Includes,
            OperatorType.DoesntInclude,
        ];

        if (invalidDateOperators.includes(operator)) {
            throw new Error(`Cannot use operator ${operator} on date fields`);
        }
    }
}
