import { ConditionType } from '../condition/types';

export enum EffectType {
    Discount = 'discount',
    BonusItem = 'bonus_item',
    Subscription = 'subscription',
    Reward = 'reward',
    Communication = 'communication',
    Condition = 'condition',
}

export interface ConditionBlock {
    if: ConditionType[] | null;
    then: string; // effectId
}
