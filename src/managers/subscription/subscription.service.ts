import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { SubscriptionEntity } from './subscription.entity';
import { 
    CreateSubscriptionRequestDTO, 
    UpdateSubscriptionStatusRequestDTO, 
    SubscriptionResponseDTO, 
    ActiveSubscriptionResponseDTO 
} from './subscription.dto';
import { SubscriptionStatus, BillingCycle } from './types';
import { REQUEST } from '@nestjs/core';
import { SubscriptionDataService } from './subscriptionData.service';
import { EffectService } from '../effect/effect.service';
import { addMonths, addQuarters, addWeeks, addYears } from 'date-fns';
import { EffectEntity } from '../effect/effect.entity';

@Injectable()
export class SubscriptionService {
    private readonly vendorId;

    constructor(
        private readonly subscriptionDataService: SubscriptionDataService,
        private readonly effectService: EffectService,
        @Inject(REQUEST) private readonly request: any,
    ) {
        this.vendorId = this.request.user.vendorId;
    }

    async createSubscription(data: CreateSubscriptionRequestDTO): Promise<SubscriptionResponseDTO> {
        const nextBillingDate = this.calculateNextBillingDate(data.startDate, data.billingCycle);

        console.log('Creating subscription with next billing date:', nextBillingDate);
        const subscription = new SubscriptionEntity({
            subscriptionId: uuidv4(),
            vendorId: this.vendorId,
            customerId: data.customerId,
            name: data.name,
            description: data.description,
            type: data.type,
            billingCycle: data.billingCycle,
            price: data.price,
            currency: data.currency || 'USD',
            status: SubscriptionStatus.Active,
            effectId: data.effectId,
            startDate: new Date(data.startDate),
            endDate: data.endDate ? new Date(data.endDate) : undefined,
            nextBillingDate,
            trialEndDate: data.trialEndDate ? new Date(data.trialEndDate) : undefined,
            metadata: data.metadata,
            createdDate: new Date(),
            updatedDate: new Date(),
        });

        return await this.subscriptionDataService.createSubscription(subscription);
    }

    async getSubscription(subscriptionId: string): Promise<SubscriptionResponseDTO | null> {
        return await this.subscriptionDataService.getSubscription(subscriptionId);
    }

    async getSubscriptionsByCustomer(customerId: string): Promise<SubscriptionResponseDTO[]> {
        return await this.subscriptionDataService.getSubscriptionsByCustomer(customerId);
    }

    async getSubscriptionsByVendor(vendorId: string): Promise<SubscriptionResponseDTO[]> {
        return await this.subscriptionDataService.getSubscriptionsByVendor(vendorId);
    }

    async updateSubscriptionStatus(
        subscriptionId: string, 
        data: UpdateSubscriptionStatusRequestDTO
    ): Promise<SubscriptionResponseDTO | null> {
        const timestamp = new Date();

        const updateData: Partial<SubscriptionEntity> = {
            status: data.status,
        };

        switch (data.status) {
            case SubscriptionStatus.Active:
                // No special handling for active status
                break;
            case SubscriptionStatus.Cancelled:
                updateData.cancelledAt = timestamp;
                break;
            case SubscriptionStatus.Paused:  
                updateData.pausedAt = timestamp;
                break;
            case SubscriptionStatus.Suspended:
                // Handle suspension logic if needed
                break;
            default:
                throw new Error(`Unsupported subscription status: ${data.status}`);
        }

        return await this.subscriptionDataService.updateSubscription(updateData, subscriptionId);
    }

    async getActiveSubscriptions(vendorId: string): Promise<ActiveSubscriptionResponseDTO[]> {
        const subscriptions = await this.subscriptionDataService.getActiveSubscriptionsByVendor(vendorId);
        const now = new Date();

        const activeSubscriptionPromises = subscriptions.map(async (subscription) => {
            const isActive = this.isSubscriptionActive(subscription, now);
            const daysUntilNextBilling = this.calculateDaysUntilNextBilling(subscription.nextBillingDate, now);
            
            let effect: EffectEntity | null= null;
            if (isActive && subscription.effectId) {
                    effect = await this.effectService.getEffect(subscription.effectId);
            }

            return {
                ...subscription,
                isActive,
                daysUntilNextBilling,
                effect,
            } as ActiveSubscriptionResponseDTO;
        });

        return await Promise.all(activeSubscriptionPromises);
    }

    async renewSubscription(subscriptionId: string): Promise<SubscriptionResponseDTO | null> {
        const subscription = await this.subscriptionDataService.getSubscription(subscriptionId);
        
        if (!subscription || subscription.status !== SubscriptionStatus.Active) {
            return null;
        }

        const nextBillingDate = this.calculateNextBillingDate(
            subscription.nextBillingDate, 
            subscription.billingCycle
        );

        return await this.subscriptionDataService.updateNextBillingDate(
            subscriptionId, 
            nextBillingDate
        );
    }

    async getSubscriptionsDueForBilling(dueDate: Date): Promise<SubscriptionResponseDTO[]> {
        console.log('Fetching subscriptions due for billing on:', dueDate);
        return await this.subscriptionDataService.getSubscriptionsDueForBilling(this.vendorId, dueDate);
    }

    private calculateNextBillingDate(currentDate: Date, billingCycle: BillingCycle): Date {
        switch (billingCycle) {
            case BillingCycle.Weekly:
                return addWeeks(currentDate, 1);
            case BillingCycle.Monthly:
                return addMonths(currentDate, 1);
            case BillingCycle.Quarterly:
                return addQuarters(currentDate, 1);
            case BillingCycle.Annual:
                return addYears(currentDate, 1);
            default:
                return addMonths(currentDate, 1);
        }
    }

    private isSubscriptionActive(subscription: SubscriptionEntity, currentDate: Date): boolean {
        if (subscription.status !== SubscriptionStatus.Active) {
            return false;
        }

        if (subscription.endDate && new Date(subscription.endDate) < currentDate) {
            return false;
        }

        return new Date(subscription.startDate) <= currentDate;
    }

    private calculateDaysUntilNextBilling(nextBillingDate: Date, currentDate: Date): number {
        const timeDiff = new Date(nextBillingDate).getTime() - currentDate.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24));
    }
}
