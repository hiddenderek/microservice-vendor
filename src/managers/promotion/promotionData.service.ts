import { Injectable } from '@nestjs/common';
import { PromotionEntity } from './promotion.entity';

import { DatabaseHelper } from '../../lib/databaseHelper';
import { concatSql, joinSql, sql } from '../../lib/sqlTag';

@Injectable()
export class PromotionDataService extends DatabaseHelper<PromotionEntity> {
    async postPromotion(promotion: PromotionEntity): Promise<PromotionEntity> {
        const result = await this.insert({ postObject: promotion });

        return result[0];
    }

    async getPromotionsByVendor(vendorId: string): Promise<PromotionEntity[]> {
        const query = sql`WHERE vendor_id = ${vendorId};`;

        return await this.select({ query });
    }

    async getPromotionById(promotionId: string): Promise<PromotionEntity | null> {
        const query = sql`SELECT * FROM promotion WHERE promotion_id = ${promotionId};`;

        const result = await this.select({ query });

        if (result?.[0]) {
            return result[0];
        }

        return null;
    }
}
