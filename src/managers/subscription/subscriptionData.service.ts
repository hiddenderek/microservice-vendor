import { Injectable } from '@nestjs/common';
import { SubscriptionEntity } from './subscription.entity';
import { DatabaseHelper } from '../../lib/databaseHelper';
import { sql } from '../../lib/sqlTag';
import { SubscriptionStatus } from './types';

@Injectable()
export class SubscriptionDataService extends DatabaseHelper<SubscriptionEntity> {
    readonly tableName = 'subscription';

    async createSubscription(subscription: SubscriptionEntity): Promise<SubscriptionEntity> {
        const result = await this.insert({ postObject: subscription });
        return result;
    }

    async getSubscription(subscriptionId: string): Promise<SubscriptionEntity | null> {
        const query = sql`
            WHERE subscription_id = ${subscriptionId}
        `;
        
        const result = await this.select({ query });
        return result.length > 0 ? result[0] : null;
    }

    async getSubscriptionsByCustomer(customerId: string): Promise<SubscriptionEntity[]> {
        const query = sql`
            WHERE customer_id = ${customerId}
            ORDER BY created_date DESC
        `;
        
        return await this.select({ query });
    }

    async getSubscriptionsByVendor(vendorId: string): Promise<SubscriptionEntity[]> {
        const query = sql`
            WHERE vendor_id = ${vendorId}
            ORDER BY created_date DESC
        `;
        
        return await this.select({ query });
    }

    async getActiveSubscriptionsByVendor(vendorId: string): Promise<SubscriptionEntity[]> {
        const query = sql`
            WHERE vendor_id = ${vendorId} 
            AND status = ${SubscriptionStatus.Active}
            AND (end_date IS NULL OR end_date > NOW())
            ORDER BY created_date DESC
        `;
        
        return await this.select({ query });
    }

    async updateSubscription(
        updatedData: Partial<SubscriptionEntity>,
        subscriptionId: string,
    ): Promise<SubscriptionEntity | null> {
        const updateData: Partial<SubscriptionEntity> = {
            ...updatedData,
            updatedDate: new Date(),
        };

        const query = sql`
            WHERE subscription_id = ${subscriptionId}
        `;

        const result = await this.update({ 
            updateObject: updateData as SubscriptionEntity, 
            query 
        });

        return result || null;
    }

    async updateNextBillingDate(subscriptionId: string, nextBillingDate: Date): Promise<SubscriptionEntity | null> {
        const updateData = {
            nextBillingDate,
            updatedDate: new Date(),
        };

        const query = sql`
            WHERE subscription_id = ${subscriptionId}
        `;

        const result = await this.update({ 
            updateObject: updateData as SubscriptionEntity, 
            query 
        });

        return result || null;
    }

    async getSubscriptionsDueForBilling(vendorId: string, dueDate: Date): Promise<SubscriptionEntity[]> {
        console.log('due date', dueDate);
        const query = sql`
            WHERE vendor_id = ${vendorId}
            AND status = ${SubscriptionStatus.Active}
            AND next_billing_date <= ${dueDate}
            ORDER BY next_billing_date ASC
        `;
        
        return await this.select({ query });
    }
}
