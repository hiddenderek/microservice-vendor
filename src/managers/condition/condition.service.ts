import { type FieldValue } from '../field-cache/types';
import {
    ConditionType,
    Field,
    LogicalOperatorType,
    ParenthesesType,
    ProcessedConditionType,
} from './types';
import { evaluateOperator } from './utils/compareOperators';
import { FieldCacheService } from '../field-cache/fieldCache.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ConditionService {
    constructor(
        private readonly fieldCacheService: FieldCacheService,
    ) {}

    async getFieldValue(field: string): Promise<FieldValue | undefined> {
        const bob= await this.fieldCacheService[field]();

        return bob;
    }

    /**
     * Recursively evaluates conditions, handling parentheses and logical operators
     * @param conditions Array of condition tokens
     * @returns Boolean result
     */
    async evaluateConditions(conditions: ConditionType[]): Promise<boolean> {
        this.validateParentheses(conditions);

        let processedConditions = [...conditions] as ProcessedConditionType[];

        while (true) {
            const pair = this.findParenthesesPair(processedConditions);
            if (!pair) break;

            const subset = processedConditions.slice(pair.start + 1, pair.end);
            const result = await this.evaluateConditions(subset as ConditionType[]);

            processedConditions = [
                ...processedConditions.slice(0, pair.start),
                { booleanResult: result },
                ...processedConditions.slice(pair.end + 1),
            ];
        }

        return await this.evaluateLogicalExpression(processedConditions);
    }

    private validateParentheses(conditions: ConditionType[]): void {
        let depth = 0;

        for (const condition of conditions) {
            if (typeof condition === 'object' && condition !== null && 'parentheses' in condition) {
                if (condition.parentheses === ParenthesesType.OpenParentheses) {
                    depth++;
                } else if (condition.parentheses === ParenthesesType.CloseParentheses) {
                    depth--;

                    if (depth < 0) {
                        throw new Error('Unmatched closing parentheses');
                    }
                }
            }
        }

        if (depth > 0) {
            throw new Error('Unmatched opening parentheses');
        }
    }

    private findParenthesesPair(
        conditions: ProcessedConditionType[],
    ): { start: number; end: number } | null {
        let depth = 0;
        let startIndex = -1;

        for (let i = 0; i < conditions.length; i++) {
            const condition = conditions[i];

            if (typeof condition === 'object' && condition !== null && 'parentheses' in condition) {
                if (condition.parentheses === ParenthesesType.OpenParentheses) {
                    if (depth === 0) {
                        startIndex = i;
                    }
                    depth++;
                } else if (condition.parentheses === ParenthesesType.CloseParentheses) {
                    depth--;

                    if (depth === 0 && startIndex !== -1) {
                        return { start: startIndex, end: i };
                    }
                }
            }
        }

        return null;
    }

    private async evaluateLogicalExpression(
        conditions: ProcessedConditionType[],
    ): Promise<boolean> {
        const processedConditions = await this.evaluateComparisonOperators(conditions);

        const andProcessed = await this.evaluateAndOperators(processedConditions);

        return this.evaluateOrOperators(andProcessed);
    }

    private async evaluateComparisonOperators(
        conditions: ProcessedConditionType[],
    ): Promise<ProcessedConditionType[]> {
        const processed: ProcessedConditionType[] = [];
        let i = 0;

        while (i < conditions.length) {
            const condition = conditions[i];

            if ('booleanResult' in condition) {
                processed.push(condition);
                i++;
                continue;
            }

            if ('logicalOperator' in condition) {
                processed.push(condition);
                i++;
                continue;
            }

            if ('parentheses' in condition) {
                processed.push(condition);
                i++;
                continue;
            }

            if ('field' in condition || 'value' in condition) {
                if (i + 2 >= conditions.length) {
                    throw new Error('Incomplete comparison expression');
                }

                const leftCondition = condition;
                const operatorCondition = conditions[i + 1];
                const rightCondition = conditions[i + 2];

                if (!('operator' in operatorCondition)) {
                    throw new Error('Operator is undefined before field evaluation');
                }

                if (!('field' in rightCondition || 'value' in rightCondition)) {
                    throw new Error('Expected field or value after operator');
                }

                let leftField: Field | null = null;
                let rightField: Field | null = null

                  const [left, right]= await Promise.all([
                    this.createFieldOrValue(leftCondition),
                    this.createFieldOrValue(rightCondition),
                ]);

                            leftField = left;
            rightField = right;


                if (!leftField || !rightField) {
                    throw new Error(`Field or value is undefined`);
                }

                const result = evaluateOperator(leftField, operatorCondition.operator, rightField);

                processed.push({ booleanResult: result });
                i += 3;
                continue;
            }

            processed.push(condition);
            i++;
        }

        return processed;
    }

    private async createFieldOrValue(condition: ConditionType): Promise<Field | null> {
        if ('value' in condition) {
            return {
                value: condition.value,
            };
        }

        if ('field' in condition) {
            const fieldValue = await this.getFieldValue(condition.field);

            if (fieldValue === undefined) {
                return null;
            }

            return { value: fieldValue };
        }

        return null;
    }

    private async evaluateAndOperators(
        conditions: ProcessedConditionType[],
    ): Promise<ProcessedConditionType[]> {
        const processed: ProcessedConditionType[] = [];
        let i = 0;

        while (i < conditions.length) {
            const current = conditions[i];

            if (typeof current === 'object' && current !== null && 'booleanResult' in current) {
                let result = current.booleanResult;
                let j = i + 1;

                // Process consecutive AND operations
                while (j + 1 < conditions.length) {
                    const operator = conditions[j];
                    const nextResult = conditions[j + 1];

                    if (
                        'logicalOperator' in operator &&
                        operator.logicalOperator === LogicalOperatorType.And &&
                        'booleanResult' in nextResult
                    ) {
                        result = result && nextResult.booleanResult;
                        j += 2;
                    } else {
                        break;
                    }
                }

                processed.push({ booleanResult: result });
                i = j;
            } else {
                processed.push(current);
                i++;
            }
        }

        return processed;
    }

    private evaluateOrOperators(conditions: ProcessedConditionType[]): boolean {
        if (conditions.length === 1) {
            const condition = conditions[0];

            if ('booleanResult' in condition) {
                return condition.booleanResult;
            }
        }

        let result: boolean | null = null;
        let i = 0;

        while (i < conditions.length) {
            const condition = conditions[i];

            if ('booleanResult' in condition) {
                if (result === null) {
                    result = condition.booleanResult;
                } else {
                    const orOperatorBeforeCondition =
                        i > 0 &&
                        'logicalOperator' in conditions[i - 1] &&
                        (conditions[i - 1] as { logicalOperator?: LogicalOperatorType })
                            .logicalOperator === LogicalOperatorType.Or;

                    if (orOperatorBeforeCondition) {
                        result = result || condition.booleanResult;
                    } else {
                        // If there's no OR operator, this shouldn't happen after AND processing
                        // but just in case, treat it as the current result
                        result = condition.booleanResult;
                    }
                }
            }

            i++;
        }

        return result ?? false;
    }
}
