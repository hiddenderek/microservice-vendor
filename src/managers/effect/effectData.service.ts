import { Injectable } from '@nestjs/common';
import { EffectEntity } from './effect.entity';
import { DatabaseHelper } from '../../lib/databaseHelper';
import { concatSql, sql } from '../../lib/sqlTag';

@Injectable()
export class EffectDataService extends DatabaseHelper<EffectEntity> {
    readonly tableName = 'effect';

    async addEffect(effect: EffectEntity): Promise<EffectEntity> {
        
        const plainConditions = effect.conditions
            ? JSON.parse(JSON.stringify(effect.conditions))
            : undefined;

        const effectToInsert = {
            ...effect,
            conditions: plainConditions,
        };
        
        const result = await this.insert({ postObject: effectToInsert });

        return result;
    }

    async getEffect(effectId: string): Promise<EffectEntity | null> {
        const query = sql`
            WHERE effect_id = ${effectId}
        `;
        
        const result = await this.select({ query });
        return result.length > 0 ? result[0] : null;
    }
}
