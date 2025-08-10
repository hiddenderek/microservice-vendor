import { DiscountType } from './types';

export class PromotionEntity {
    promotionId!: string;
    vendorId!: string;
    name!: string;
    description?: string;
    effectId?: string;
    startDate!: Date;
    endDate!: Date;
    menuItemIds!: string[];
    createdDate!: Date;
    updatedDate!: Date;

    constructor(init: Partial<PromotionEntity>) {
        Object.assign(this, init);
    }
}
