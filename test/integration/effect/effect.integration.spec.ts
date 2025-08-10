import jwt from 'jwt-simple';
import tokenBody from '../../fixtures/tokenBody.json';
import { mockRequest, setupTest } from '../testHelpers';
import { EffectType } from '../../../src/managers/effect/types';
import { OperatorType, LogicalOperatorType } from '../../../src/managers/condition/types';
import { FieldCacheService } from '../../../src/managers/field-cache/fieldCache.service';

const token = jwt.encode(tokenBody, 'test');

describe('effect', () => {
    setupTest(['effect']);

    FieldCacheService.prototype.test = jest.fn().mockResolvedValue(1);

    describe('POST /effect', () => {
        it('should create a regular effect', async () => {
            const result = await mockRequest({
                path: `/effect`,
                action: 'post',
                body: {
                    type: EffectType.Discount,
                    value: 10,
                    details: {
                        description: 'Test discount effect'
                    }
                },
                token,
            });

            expect(result.status).toBe(201);
            expect(result.body).toEqual(
                expect.objectContaining({
                    effectId: expect.any(String),
                    type: EffectType.Discount,
                    value: 10,
                    details: {
                        description: 'Test discount effect'
                    },
                    conditions: null,
                    targetId: null,
                    createdDate: expect.any(String),
                    updatedDate: expect.any(String),
                })
            );
        });

        it('should not create a regular effect with conditions', async () => {
            const result = await mockRequest({
                path: `/effect`,
                action: 'post',
                body: {
                    type: EffectType.Discount,
                    value: 15,
                    details: {
                        description: 'Conditional discount effect'
                    },
                    conditions: [
                        {
                            if: [
                                { field: 'test' },
                                { operator: OperatorType.GreaterThan },
                                { value: 5 }
                            ],
                            then: 'some-effect-id'
                        }
                    ]
                },
                token,
            });

            expect(result.status).toBe(400);
        });
    });

    describe('POST /effect/condition', () => {
        it('should create a conditional effect', async () => {
            const result = await mockRequest({
                path: `/effect/condition`,
                action: 'post',
                body: {
                    details: {
                        description: 'Test conditional effect'
                    },
                    type: EffectType.Condition,
                    conditions: [
                        {
                            if: [
                                { field: 'test' },
                                { operator: OperatorType.Equals },
                                { value: 10 }
                            ],
                            then: 'effect-id-1'
                        },
                        {
                            if: [
                                { field: 'test2' },
                                { operator: OperatorType.GreaterThan },
                                { value: 20 }
                            ],
                            then: 'effect-id-2'
                        }
                    ]
                },
                token,
            });

            expect(result.status).toBe(201);
            expect(result.body).toEqual(
                expect.objectContaining({
                    effectId: expect.any(String),
                    type: EffectType.Condition,
                    details: {
                        description: 'Test conditional effect'
                    },
                    targetId: null,
                    conditions: [
                        {
                            if: [
                                { field: 'test' },
                                { operator: OperatorType.Equals },
                                { value: 10 }
                            ],
                            then: 'effect-id-1'
                        },
                        {
                            if: [
                                { field: 'test2' },
                                { operator: OperatorType.GreaterThan },
                                { value: 20 }
                            ],
                            then: 'effect-id-2'
                        }
                    ],
                    createdDate: expect.any(String),
                    updatedDate: expect.any(String),
                })
            );
        });

        it('should create a conditional effect with complex conditions', async () => {
            const result = await mockRequest({
                path: `/effect/condition`,
                action: 'post',
                body: {
                    details: {
                        description: 'Complex conditional effect'
                    },
                    type: EffectType.Condition,
                    conditions: [
                        {
                            if: [
                                { field: 'test' },
                                { operator: OperatorType.Equals },
                                { value: 10 },
                                { logicalOperator: LogicalOperatorType.And },
                                { field: 'name' },
                                { operator: OperatorType.Equals },
                                { value: 'John' }
                            ],
                            then: 'complex-effect-id'
                        }
                    ]
                },
                token,
            });

            expect(result.status).toBe(201);
            expect(result.body).toEqual(
                expect.objectContaining({
                    effectId: expect.any(String),
                    type: EffectType.Condition,
                
                    targetId: null,
                    details: {
                        description: 'Complex conditional effect'
                    },
                    conditions: expect.any(Array),
                    createdDate: expect.any(String),
                    updatedDate: expect.any(String),
                })
            );
        });
    });

    describe('GET /effect/:effectId', () => {
        it('should retrieve an effect by ID', async () => {
            // First create an effect
            const createResult = await mockRequest({
                path: `/effect`,
                action: 'post',
                body: {
                    type: EffectType.Discount,
                    value: 25,

                    details: {
                        description: 'Test retrievable effect'
                    }
                },
                token,
            });

            expect(createResult.status).toBe(201);
            const effectId = createResult.body.effectId;

            // Then retrieve it
            const getResult = await mockRequest({
                path: `/effect/${effectId}`,
                action: 'get',
                token,
            });

            expect(getResult.status).toBe(200);
            expect(getResult.body).toEqual(
                expect.objectContaining({
                    effectId,
                    type: EffectType.Discount,
                    value: 25,
                    conditions: null,
                    targetId: null,
                    details: {
                        description: 'Test retrievable effect'
                    },
                    createdDate: expect.any(String),
                    updatedDate: expect.any(String),
                })
            );
        });

        it('should return null for non-existent effect', async () => {
            const getResult = await mockRequest({
                path: `/effect/non-existent-id`,
                action: 'get',
                token,
            });

            expect(getResult.status).toBe(200);
            expect(getResult.body).toEqual({});
        });
    });

    describe('POST /effect/:effectId', () => {
        it('should evaluate conditional effect and return matching effect', async () => {
            // First create a target effect
            const targetEffectResult = await mockRequest({
                path: `/effect`,
                action: 'post',
                body: {
                    type: EffectType.Discount,
                    value: 30,
                    details: {
                        description: 'Target effect for evaluation'
                    }
                },
                token,
            });

            expect(targetEffectResult.status).toBe(201);
            const targetEffectId = targetEffectResult.body.effectId;

            // Create a conditional effect that should match
            const conditionalResult = await mockRequest({
                path: `/effect/condition`,
                action: 'post',
                body: {
                    details: {
                        description: 'Conditional effect for evaluation test'
                    },
                    type: EffectType.Condition,
                    conditions: [
                        {
                            if: [
                                { field: 'test' },
                                { operator: OperatorType.Equals },
                                { value: 10 }
                            ],
                            then: targetEffectId
                        }
                    ]
                },
                token,
            });

            expect(conditionalResult.status).toBe(201);
            const conditionalEffectId = conditionalResult.body.effectId;

            // Evaluate the conditional effect
            const evaluateResult = await mockRequest({
                path: `/effect/${conditionalEffectId}`,
                action: 'get',
                token,
            });

            expect(evaluateResult.status).toBe(200);
            expect(evaluateResult.body).toEqual(
                expect.objectContaining({
                    effectId: targetEffectId,
                    type: EffectType.Discount,
                    value: 30,
                    targetId: null,
                    details: {
                        description: 'Target effect for evaluation'
                    },
                    createdDate: expect.any(String),
                    updatedDate: expect.any(String),
                })
            );
        });

        it('should return null when no conditions match', async () => {
            // Create a conditional effect with conditions that won't match
            const conditionalResult = await mockRequest({
                path: `/effect/condition`,
                action: 'post',
                body: {
                    details: {
                        description: 'Non-matching conditional effect'
                    },
                    type: EffectType.Condition,
                    conditions: [
                        {
                            if: [
                                { field: 'test' },
                                { operator: OperatorType.Equals },
                                { value: 999 } // This won't match the mock field value
                            ],
                            then: 'some-effect-id'
                        }
                    ]
                },
                token,
            });

            expect(conditionalResult.status).toBe(201);
            const conditionalEffectId = conditionalResult.body.effectId;

            // Evaluate the conditional effect
            const evaluateResult = await mockRequest({
                path: `/effect/${conditionalEffectId}`,
                action: 'get',
                token,
            });

            expect(evaluateResult.status).toBe(200);
            expect(evaluateResult.body).toEqual({});
        });

        it('should return null for non-existent effect', async () => {
            const evaluateResult = await mockRequest({
                path: `/effect/non-existent-id`,
                action: 'get',
                token,
            });

            expect(evaluateResult.status).toBe(200);
            expect(evaluateResult.body).toEqual({});
        });
    });
});
