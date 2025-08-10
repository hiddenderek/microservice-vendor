import { Injectable } from '@nestjs/common';
import { EffectType } from './types';
import { EffectEntity } from './effect.entity';
import { v4 as uuidv4 } from 'uuid';

export interface Effect {
    type: EffectType;
    targetId: string;
    value: number;
    details?: Record<string, any>;
}

@Injectable()
export class EffectEntityFactory {
    generateDiscountEffect(value: number, details?: Record<string, any>): EffectEntity {
        return new EffectEntity({
            effectId: uuidv4(),
            type: EffectType.Discount,
            value,
            details,
            createdDate: new Date(),
            updatedDate: new Date(),
        });
    }

    generateBonusItemEffect(value: number, details?: Record<string, any>): EffectEntity {
        return new EffectEntity({
            effectId: uuidv4(),
            type: EffectType.BonusItem,
            value,
            details,
            createdDate: new Date(),
            updatedDate: new Date(),
        });
    }

    generateSubscriptionEffect(value: number, details?: Record<string, any>): EffectEntity {
        return new EffectEntity({
            effectId: uuidv4(),
            type: EffectType.Subscription,
            value,
            details,
            createdDate: new Date(),
            updatedDate: new Date(),
        });
    }

    generateRewardEffect(value: number, details?: Record<string, any>): EffectEntity {
        return new EffectEntity({
            effectId: uuidv4(),
            type: EffectType.Reward,
            value,
            details,
            createdDate: new Date(),
            updatedDate: new Date(),
        });
    }
}
