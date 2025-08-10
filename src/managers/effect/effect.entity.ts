import { ConditionBlock, EffectType } from './types';

export class EffectEntity {
    effectId!: string;
    type!: EffectType;
    value?: number | string;
    details?: Record<string, any>;
    conditions?: ConditionBlock[];
    createdDate!: Date;
    updatedDate!: Date;

    constructor(init: Partial<EffectEntity>) {
        Object.assign(this, init);
    }
}
