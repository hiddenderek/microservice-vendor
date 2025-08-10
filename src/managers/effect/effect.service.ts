import { Injectable } from '@nestjs/common';
import { EffectEntity } from './effect.entity';
import { ConditionBlock, EffectType } from './types';
import { v4 as uuidv4 } from 'uuid';
import { EffectCreateRequestDTO } from './effect.dto';
import { ConditionService } from '../condition/condition.service';
import { EffectDataService } from './effectData.service';

@Injectable()
export class EffectService {
    constructor(
        private readonly conditionService: ConditionService,
        private readonly effectDataService: EffectDataService,
    ) {}

    async createEffect(effect: EffectCreateRequestDTO): Promise<EffectEntity> {
        const { type, value, details, conditions } = effect;

        console.log('Creating effect with type:', type, 'value:', value, 'details:', details, 'conditions:', conditions);
        const newEffect = new EffectEntity({
            effectId: uuidv4(),
            type,
            value,
            details,
            //@ts-ignore
            conditions,
            createdDate: new Date(),
            updatedDate: new Date(),
        });

        return await this.effectDataService.addEffect(newEffect);
    }

    async createConditionalEffect(effect: EffectCreateRequestDTO): Promise<EffectEntity> {
        const { details, conditions } = effect;

        const newEffect = new EffectEntity({
            effectId: uuidv4(),
            type: EffectType.Condition,
            details,
            //@ts-ignore
            conditions,
            createdDate: new Date(),
            updatedDate: new Date(),
        });

        return await this.effectDataService.addEffect(newEffect);
    }

    async getEffect(effectId: string): Promise<EffectEntity | null> {
        const effect = await this.effectDataService.getEffect(effectId);

        if (!effect) {
            return null;
        }

        if (effect.type === EffectType.Condition && effect.conditions) {
            const activeEffect = await this.chooseEffectFromConditions(effect.conditions);
        
            if (!activeEffect) {
                return null;
            }

            return await this.getEffect(activeEffect);
        }

        return effect;
    }

    /**
     * Parses a ConditionBlock array and determines the effectId to choose based on the provided context.
     * Supports parentheses (grouping), equals, AND, OR logic based on OperatorType enum.
     * @param conditions Array of ConditionBlock
     * @param context Object with values for fields referenced in conditions
     * @returns effectId string if a condition matches, otherwise null
     */
    async chooseEffectFromConditions(
        conditions: ConditionBlock[] | undefined,
    ): Promise<string | null> {
        if (!conditions) {
            return null;
        }

        for (const block of conditions) {
            if (!block.if) continue;

            const conditionResult = await this.conditionService.evaluateConditions(block.if);

            if (conditionResult) {
                return block.then;
            }
        }
        return null;
    }
}
