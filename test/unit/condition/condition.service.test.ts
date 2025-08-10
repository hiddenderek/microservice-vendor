import { addDays, subDays } from 'date-fns';
import { ConditionService } from '../../../src/managers/condition/condition.service';
import {
    OperatorType,
    ConditionType,
    LogicalOperatorType,
    ParenthesesType,
} from '../../../src/managers/condition/types';
import { FieldCacheService } from '../../../src/managers/field-cache/fieldCache.service';

describe('ConditionService.evaluateConditions', () => {
    let service: ConditionService;

    beforeEach(() => {
        service = new ConditionService(new FieldCacheService({ user: { vendorId: 'test-vendor-id' } }));

        jest.spyOn(service, 'getFieldValue').mockImplementation(async (field: string) => {
            if (field === 'test') return 10;
            if (field === 'test2') return 20;
            if (field === 'test3') return 5;
            if (field === 'name') return 'John';
            if (field === 'name2') return 'Jane';
            return 'value';
        });
    });

    describe('Basic comparisons', () => {
        describe('Date difference operators', () => {
            it('returns true for DaysAfter when date is after by day amount', async () => {
                const now = new Date(); // Represents the current date and time
                const tenDaysAgo = subDays(now, 10);
                const conditions: ConditionType[] = [
                    { value: 10 }, // Should be true, 10 days ago is before now by 10 days
                    { operator: OperatorType.DaysAfter },
                    { value: tenDaysAgo.toISOString() },
                ];
                expect(await service.evaluateConditions(conditions)).toBe(true);
            });

            it('returns false for DaysAfter when date is not after by day amount', async () => {
                const now = new Date(); // Represents the current date and time
                const threeDaysAgo = subDays(now, 3);
                const conditions: ConditionType[] = [
                    { value: 10 },
                    { operator: OperatorType.DaysAfter },
                    { value: threeDaysAgo.toISOString() },
                ];
                expect(await service.evaluateConditions(conditions)).toBe(false);
            });

            it('returns true for DaysBefore when date is before by day amount', async () => {
                const now = new Date(); // Represents the current date and time
                const tenDaysLater = addDays(now, 10);
                const conditions: ConditionType[] = [
                    { value: 10 },
                    { operator: OperatorType.DaysBefore },
                    { value: tenDaysLater.toISOString() },
                ];
                expect(await service.evaluateConditions(conditions)).toBe(true);
            });

            it('returns false for DaysBefore when date is not before by day amount', async () => {
                const now = new Date(); // Represents the current date and time
                const threeDaysLater = addDays(now, 3);
                const conditions: ConditionType[] = [
                    { value: 10 },
                    { operator: OperatorType.DaysBefore },
                    { value: threeDaysLater.toISOString() },
                ];
                expect(await service.evaluateConditions(conditions)).toBe(false);
            });
        });
        it('returns true for Equals when values match', async () => {
            const conditions: ConditionType[] = [
                { field: 'test' },
                { operator: OperatorType.Equals },
                { field: 'test' },
            ];
            expect(await service.evaluateConditions(conditions)).toBe(true);
        });

        it('returns false for Equals when values do not match', async () => {
            const conditions: ConditionType[] = [
                { field: 'test' },
                { operator: OperatorType.Equals },
                { field: 'test2' },
            ];
            expect(await service.evaluateConditions(conditions)).toBe(false);
        });

        it('returns true for GreaterThan when first value is greater', async () => {
            const conditions: ConditionType[] = [
                { field: 'test2' }, // 20
                { operator: OperatorType.GreaterThan },
                { field: 'test' }, // 10
            ];
            expect(await service.evaluateConditions(conditions)).toBe(true);
        });

        it('returns false for GreaterThan when values are equal', async () => {
            const conditions: ConditionType[] = [
                { field: 'test' },
                { operator: OperatorType.GreaterThan },
                { field: 'test' },
            ];
            expect(await service.evaluateConditions(conditions)).toBe(false);
        });

        it('returns true for LessThan when first value is less', async () => {
            const conditions: ConditionType[] = [
                { field: 'test' }, // 10
                { operator: OperatorType.LessThan },
                { field: 'test2' }, // 20
            ];
            expect(await service.evaluateConditions(conditions)).toBe(true);
        });

        it('returns true for NotEquals when values are different', async () => {
            const conditions: ConditionType[] = [
                { field: 'test' },
                { operator: OperatorType.NotEquals },
                { field: 'test2' },
            ];
            expect(await service.evaluateConditions(conditions)).toBe(true);
        });

        it('compares field to arbitrary value', async () => {
            const conditions: ConditionType[] = [
                { field: 'test' }, // Will resolve to 10
                { operator: OperatorType.GreaterThan },
                { value: 5 }, // Direct value
            ];
            expect(await service.evaluateConditions(conditions)).toBe(true);
        });

        it('compares field to arbitrary value again', async () => {
            const conditions: ConditionType[] = [
                { field: 'test' }, // Will resolve to 10
                { operator: OperatorType.GreaterThan },
                { value: 12 }, // Direct value
            ];
            expect(await service.evaluateConditions(conditions)).toBe(false);
        });
    });

    describe('Logical operators (PEMDAS)', () => {
        it('evaluates AND with higher precedence than OR', async () => {
            // true OR false AND false = true OR (false AND false) = true OR false = true
            const conditions: ConditionType[] = [
                { field: 'test' },
                { operator: OperatorType.Equals },
                { field: 'test' }, // true
                { logicalOperator: LogicalOperatorType.Or },
                { field: 'test' },
                { operator: OperatorType.Equals },
                { field: 'test2' }, // false
                { logicalOperator: LogicalOperatorType.And },
                { field: 'test' },
                { operator: OperatorType.Equals },
                { field: 'test2' }, // false
            ];
            expect(await service.evaluateConditions(conditions)).toBe(true);
        });

        it('evaluates multiple AND operations correctly', async () => {
            // true AND true AND false = false
            const conditions: ConditionType[] = [
                { field: 'test' },
                { operator: OperatorType.Equals },
                { field: 'test' }, // true
                { logicalOperator: LogicalOperatorType.And },
                { field: 'test2' },
                { operator: OperatorType.GreaterThan },
                { field: 'test' }, // true (20 > 10)
                { logicalOperator: LogicalOperatorType.And },
                { field: 'test' },
                { operator: OperatorType.Equals },
                { field: 'test2' }, // false
            ];
            expect(await service.evaluateConditions(conditions)).toBe(false);
        });

        it('evaluates multiple OR operations correctly', async () => {
            // false OR false OR true = true
            const conditions: ConditionType[] = [
                { field: 'test' },
                { operator: OperatorType.Equals },
                { field: 'test2' }, // false
                { logicalOperator: LogicalOperatorType.Or },
                { field: 'test3' },
                { operator: OperatorType.GreaterThan },
                { field: 'test2' }, // false (5 > 20)
                { logicalOperator: LogicalOperatorType.Or },
                { field: 'test' },
                { operator: OperatorType.LessThan },
                { field: 'test2' }, // true (10 < 20)
            ];
            expect(await service.evaluateConditions(conditions)).toBe(true);
        });
    });

    describe('Parentheses handling', () => {
        it('evaluates parentheses with higher precedence', async () => {
            // false OR (true AND false) = false OR false = false
            const conditions: ConditionType[] = [
                { field: 'test' },
                { operator: OperatorType.Equals },
                { field: 'test2' }, // false
                { logicalOperator: LogicalOperatorType.Or },
                { parentheses: ParenthesesType.OpenParentheses },
                { field: 'test' },
                { operator: OperatorType.Equals },
                { field: 'test' }, // true
                { logicalOperator: LogicalOperatorType.And },
                { field: 'test' },
                { operator: OperatorType.Equals },
                { field: 'test2' }, // false
                { parentheses: ParenthesesType.CloseParentheses },
            ];
            expect(await service.evaluateConditions(conditions)).toBe(false);
        });

        it('evaluates nested parentheses correctly', async () => {
            // (true AND (false OR true)) = (true AND true) = true
            const conditions: ConditionType[] = [
                { parentheses: ParenthesesType.OpenParentheses },
                { field: 'test' },
                { operator: OperatorType.Equals },
                { field: 'test' }, // true
                { logicalOperator: LogicalOperatorType.And },
                { parentheses: ParenthesesType.OpenParentheses },
                { field: 'test' },
                { operator: OperatorType.Equals },
                { field: 'test2' }, // false
                { logicalOperator: LogicalOperatorType.Or },
                { field: 'test2' },
                { operator: OperatorType.GreaterThan },
                { field: 'test' }, // true
                { parentheses: ParenthesesType.CloseParentheses },
                { parentheses: ParenthesesType.CloseParentheses },
            ];
            expect(await service.evaluateConditions(conditions)).toBe(true);
        });
    });

    describe('String comparisons', () => {
        it('handles string equality correctly', async () => {
            const conditions: ConditionType[] = [
                { field: 'name' },
                { operator: OperatorType.Equals },
                { field: 'name' },
            ];
            expect(await service.evaluateConditions(conditions)).toBe(true);
        });

        it('handles string inequality correctly', async () => {
            const conditions: ConditionType[] = [
                { field: 'name' },
                { operator: OperatorType.NotEquals },
                { field: 'name2' },
            ];
            expect(await service.evaluateConditions(conditions)).toBe(true);
        });
    });

    describe('Edge cases', () => {
        it('returns false for empty conditions array', async () => {
            const conditions: ConditionType[] = [];
            expect(await service.evaluateConditions(conditions)).toBe(false);
        });

        it('handles single comparison correctly', async () => {
            const conditions: ConditionType[] = [
                { field: 'test' },
                { operator: OperatorType.Equals },
                { field: 'test' },
            ];
            expect(await service.evaluateConditions(conditions)).toBe(true);
        });

        it('handles complex PEMDAS expression', async () => {
            // true AND false OR true AND true = (true AND false) OR (true AND true) = false OR true = true
            const conditions: ConditionType[] = [
                { field: 'test' },
                { operator: OperatorType.Equals },
                { field: 'test' }, // true
                { logicalOperator: LogicalOperatorType.And },
                { field: 'test' },
                { operator: OperatorType.Equals },
                { field: 'test2' }, // false
                { logicalOperator: LogicalOperatorType.Or },
                { field: 'test2' },
                { operator: OperatorType.GreaterThan },
                { field: 'test' }, // true
                { logicalOperator: LogicalOperatorType.And },
                { field: 'test3' },
                { operator: OperatorType.LessThan },
                { field: 'test' }, // true
            ];
            expect(await service.evaluateConditions(conditions)).toBe(true);
        });
    });

    describe('Error handling', () => {
        it('throws if operator is missing before field', async () => {
            const conditions: ConditionType[] = [{ field: 'any' }, { field: 'any' }];
            await expect(service.evaluateConditions(conditions)).rejects.toThrow(
                'Incomplete comparison expression',
            );
        });

        it('throws if operator is missing between fields', async () => {
            const conditions: ConditionType[] = [{ field: 'test' }, { field: 'test2' }];
            await expect(service.evaluateConditions(conditions)).rejects.toThrow(
                'Incomplete comparison expression',
            );
        });

        it('throws if field is missing after operator', async () => {
            const conditions: ConditionType[] = [
                { field: 'test' },
                { operator: OperatorType.Equals },
            ];
            await expect(service.evaluateConditions(conditions)).rejects.toThrow(
                'Incomplete comparison expression',
            );
        });

        it('throws if getFieldValue returns undefined', async () => {
            jest.spyOn(service, 'getFieldValue').mockResolvedValue(undefined);
            const conditions: ConditionType[] = [
                { field: 'nonexistent' },
                { operator: OperatorType.Equals },
                { field: 'test' },
            ];
            await expect(service.evaluateConditions(conditions)).rejects.toThrow(
                'Field or value is undefined',
            );
        });

        it('throws on unmatched parentheses', async () => {
            const conditions: ConditionType[] = [
                { parentheses: ParenthesesType.OpenParentheses },
                { field: 'test' },
                { operator: OperatorType.Equals },
                { field: 'test' },
                // Missing close parentheses
            ];
            await expect(service.evaluateConditions(conditions)).rejects.toThrow(
                'Unmatched opening parentheses',
            );
        });
    });
});
