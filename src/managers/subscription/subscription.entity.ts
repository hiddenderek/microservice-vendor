import { SubscriptionStatus, SubscriptionType, BillingCycle } from './types';

export class SubscriptionEntity {
    subscriptionId!: string;
    vendorId!: string;
    customerId!: string;
    name!: string;
    description?: string;
    type!: SubscriptionType;
    billingCycle!: BillingCycle;
    price!: number;
    currency!: string;
    status!: SubscriptionStatus;
    effectId?: string;
    startDate!: Date;
    endDate?: Date;
    nextBillingDate!: Date;
    trialEndDate?: Date;
    cancelledAt?: Date;
    pausedAt?: Date;
    metadata?: Record<string, any>;
    createdDate!: Date;
    updatedDate!: Date;

    constructor(init: Partial<SubscriptionEntity>) {
        Object.assign(this, init);
    }
}
