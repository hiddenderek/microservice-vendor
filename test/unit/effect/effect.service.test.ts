import { Test, TestingModule } from '@nestjs/testing';
import { EffectService } from '../../../src/managers/effect/effect.service';
import { EffectDataService } from '../../../src/managers/effect/effectData.service';
import { ConditionService } from '../../../src/managers/condition/condition.service';
import { EffectType } from '../../../src/managers/effect/types';
import { OperatorType } from '../../../src/managers/condition/types';

describe('EffectService', () => {
    let service: EffectService;
    let effectDataService: EffectDataService;
    let conditionService: ConditionService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EffectService,
                {
                    provide: EffectDataService,
                    useValue: {
                        addEffect: jest.fn(),
                        getEffect: jest.fn(),
                    },
                },
                {
                    provide: ConditionService,
                    useValue: {
                        evaluateConditions: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<EffectService>(EffectService);
        effectDataService = module.get<EffectDataService>(EffectDataService);
        conditionService = module.get<ConditionService>(ConditionService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createEffect', () => {
        it('should create and save a regular effect', async () => {
            const mockEffect = {
                type: EffectType.Discount,
                value: 10,
                details: { description: 'Test discount' },
                conditions: undefined,
            };

            const mockSavedEffect = {
                effectId: 'test-effect-id',
                ...mockEffect,
                createdDate: new Date(),
                updatedDate: new Date(),
            };

            jest.spyOn(effectDataService, 'addEffect').mockResolvedValue(mockSavedEffect);

            const result = await service.createEffect(mockEffect);

            expect(effectDataService.addEffect).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: EffectType.Discount,
                    value: 10,
                    details: { description: 'Test discount' },
                    effectId: expect.any(String),
                    createdDate: expect.any(Date),
                    updatedDate: expect.any(Date),
                })
            );
            expect(result).toEqual(mockSavedEffect);
        });
    });

    describe('createConditionalEffect', () => {
        it('should create and save a conditional effect', async () => {
            const mockEffect = {
                type: EffectType.Condition,
                value: 0,
                details: { description: 'Test conditional effect' },
                conditions: [
                    {
                        if: [
                            { field: 'test' },
                            { operator: OperatorType.Equals },
                            { value: 10 }
                        ],
                        then: 'target-effect-id'
                    }
                ],
            };

            const mockSavedEffect = {
                effectId: 'test-conditional-effect-id',
                type: EffectType.Condition,
                details: mockEffect.details,
                conditions: mockEffect.conditions,
                createdDate: new Date(),
                updatedDate: new Date(),
            };

            jest.spyOn(effectDataService, 'addEffect').mockResolvedValue(mockSavedEffect);

            const result = await service.createConditionalEffect(mockEffect);

            expect(effectDataService.addEffect).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: EffectType.Condition,
                    details: { description: 'Test conditional effect' },
                    conditions: mockEffect.conditions,
                    effectId: expect.any(String),
                    createdDate: expect.any(Date),
                    updatedDate: expect.any(Date),
                })
            );
            expect(result).toEqual(mockSavedEffect);
        });
    });

    describe('getEffect', () => {
        it('should retrieve an effect by ID', async () => {
            const mockEffect = {
                effectId: 'test-effect-id',
                type: EffectType.Discount,
                value: 15,
                details: { description: 'Retrieved effect' },
                createdDate: new Date(),
                updatedDate: new Date(),
            };

            jest.spyOn(effectDataService, 'getEffect').mockResolvedValue(mockEffect);

            const result = await service.getEffect('test-effect-id');

            expect(effectDataService.getEffect).toHaveBeenCalledWith('test-effect-id');
            expect(result).toEqual(mockEffect);
        });
    });

    describe('getEffectFromConditions', () => {
        it('should evaluate conditions and return the matching effect', async () => {
            const conditionalEffect = {
                effectId: 'conditional-effect-id',
                type: EffectType.Condition,
                conditions: [
                    {
                        if: [
                            { field: 'test' },
                            { operator: OperatorType.Equals },
                            { value: 10 }
                        ],
                        then: 'target-effect-id'
                    }
                ],
                createdDate: new Date(),
                updatedDate: new Date(),
            };

            const targetEffect = {
                effectId: 'target-effect-id',
                type: EffectType.Discount,
                value: 20,
                details: { description: 'Target effect' },
                createdDate: new Date(),
                updatedDate: new Date(),
            };

            jest.spyOn(effectDataService, 'getEffect')
                .mockResolvedValueOnce(conditionalEffect)
                .mockResolvedValueOnce(targetEffect);
            
            jest.spyOn(conditionService, 'evaluateConditions').mockResolvedValue(true);

            const result = await service.getEffect('conditional-effect-id');

            expect(effectDataService.getEffect).toHaveBeenCalledWith('conditional-effect-id');
            expect(conditionService.evaluateConditions).toHaveBeenCalledWith(conditionalEffect.conditions[0].if);
            expect(effectDataService.getEffect).toHaveBeenCalledWith('target-effect-id');
            expect(result).toEqual(targetEffect);
        });

        it('should return null if no conditions match', async () => {
            const conditionalEffect = {
                effectId: 'conditional-effect-id',
                type: EffectType.Condition,
                conditions: [
                    {
                        if: [
                            { field: 'test2' },
                            { operator: OperatorType.Equals },
                            { value: 999 }
                        ],
                        then: 'target-effect-id'
                    }
                ],
                createdDate: new Date(),
                updatedDate: new Date(),
            };

            jest.spyOn(effectDataService, 'getEffect').mockResolvedValue(conditionalEffect);
            jest.spyOn(conditionService, 'evaluateConditions').mockResolvedValue(false);

            const result = await service.getEffect('conditional-effect-id');

            expect(effectDataService.getEffect).toHaveBeenCalledWith('conditional-effect-id');
            expect(conditionService.evaluateConditions).toHaveBeenCalledWith(conditionalEffect.conditions[0].if);
            expect(result).toBeNull();
        });

        it('should return null for non-existent effect', async () => {
            jest.spyOn(effectDataService, 'getEffect').mockResolvedValue(null);

            const result = await service.getEffect('non-existent-id');

            expect(effectDataService.getEffect).toHaveBeenCalledWith('non-existent-id');
            expect(result).toBeNull();
        });
    });

    describe('chooseEffectFromConditions', () => {
        it('should return the first matching effect ID', async () => {
            const conditions = [
                {
                    if: [
                        { field: 'test' },
                        { operator: OperatorType.Equals },
                        { value: 10 }
                    ],
                    then: 'first-effect-id'
                },
                {
                    if: [
                        { field: 'test2' },
                        { operator: OperatorType.Equals },
                        { value: 20 }
                    ],
                    then: 'second-effect-id'
                }
            ];

            jest.spyOn(conditionService, 'evaluateConditions')
                .mockResolvedValueOnce(true)
                .mockResolvedValueOnce(false);

            const result = await service.chooseEffectFromConditions(conditions);

            expect(conditionService.evaluateConditions).toHaveBeenCalledWith(conditions[0].if);
            expect(result).toBe('first-effect-id');
        });

        it('should return null if no conditions match', async () => {
            const conditions = [
                {
                    if: [
                        { field: 'test' },
                        { operator: OperatorType.Equals },
                        { value: 999 }
                    ],
                    then: 'effect-id'
                }
            ];

            jest.spyOn(conditionService, 'evaluateConditions').mockResolvedValue(false);

            const result = await service.chooseEffectFromConditions(conditions);

            expect(conditionService.evaluateConditions).toHaveBeenCalledWith(conditions[0].if);
            expect(result).toBeNull();
        });

        it('should return null for undefined conditions', async () => {
            const result = await service.chooseEffectFromConditions(undefined);
            expect(result).toBeNull();
        });

        it('should skip conditions without if clause', async () => {
            const conditions = [
                {
                    if: null,
                    then: 'skipped-effect-id'
                },
                {
                    if: [
                        { field: 'test' },
                        { operator: OperatorType.Equals },
                        { value: 10 }
                    ],
                    then: 'valid-effect-id'
                }
            ];

            jest.spyOn(conditionService, 'evaluateConditions').mockResolvedValue(true);

            const result = await service.chooseEffectFromConditions(conditions);

            expect(conditionService.evaluateConditions).toHaveBeenCalledTimes(1);
            expect(conditionService.evaluateConditions).toHaveBeenCalledWith(conditions[1].if);
            expect(result).toBe('valid-effect-id');
        });
    });
});
