import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsDefined,
    IsEnum,
    IsOptional,
    IsNumber,
    IsDateString,
    IsObject,
    Min,
} from 'class-validator';
import { SubscriptionStatus, SubscriptionType, BillingCycle } from './types';

export class CreateSubscriptionRequestDTO {
    @ApiProperty({ description: 'Customer ID' })
    @IsDefined()
    @IsString()
    readonly customerId!: string;

    @ApiProperty({ description: 'Subscription name' })
    @IsDefined()
    @IsString()
    readonly name!: string;

    @ApiProperty({ description: 'Subscription description', required: false })
    @IsOptional()
    @IsString()
    readonly description?: string;

    @ApiProperty({ enum: SubscriptionType, description: 'Subscription type' })
    @IsDefined()
    @IsEnum(SubscriptionType)
    readonly type!: SubscriptionType;

    @ApiProperty({ enum: BillingCycle, description: 'Billing cycle' })
    @IsDefined()
    @IsEnum(BillingCycle)
    readonly billingCycle!: BillingCycle;

    @ApiProperty({ description: 'Subscription price' })
    @IsDefined()
    @IsNumber()
    @Min(0)
    readonly price!: number;

    @ApiProperty({ description: 'Currency code (e.g., USD, EUR)', default: 'USD' })
    @IsOptional()
    @IsString()
    readonly currency?: string;

    @ApiProperty({ description: 'Effect ID for subscription benefits', required: false })
    @IsOptional()
    @IsString()
    readonly effectId?: string;

    @ApiProperty({ description: 'Subscription start date' })
    @IsDefined()
    @IsDateString()
    readonly startDate!: Date;

    @ApiProperty({ description: 'Subscription end date', required: false })
    @IsOptional()
    @IsDateString()
    readonly endDate?: Date;

    @ApiProperty({ description: 'Trial end date', required: false })
    @IsOptional()
    @IsDateString()
    readonly trialEndDate?: Date;

    @ApiProperty({ description: 'Additional metadata', required: false })
    @IsOptional()
    @IsObject()
    readonly metadata?: Record<string, any>;
}

export class UpdateSubscriptionStatusRequestDTO {
    @ApiProperty({ enum: SubscriptionStatus, description: 'New subscription status' })
    @IsDefined()
    @IsEnum(SubscriptionStatus)
    readonly status!: SubscriptionStatus;

    @ApiProperty({ description: 'Reason for status change', required: false })
    @IsOptional()
    @IsString()
    readonly reason?: string;
}

export class SubscriptionResponseDTO {
    @ApiProperty({ description: 'Subscription ID' })
    @IsDefined()
    @IsString()
    readonly subscriptionId!: string;

    @ApiProperty({ description: 'Vendor ID' })
    @IsDefined()
    @IsString()
    readonly vendorId!: string;

    @ApiProperty({ description: 'Customer ID' })
    @IsDefined()
    @IsString()
    readonly customerId!: string;

    @ApiProperty({ description: 'Subscription name' })
    @IsDefined()
    @IsString()
    readonly name!: string;

    @ApiProperty({ description: 'Subscription description', required: false })
    @IsOptional()
    @IsString()
    readonly description?: string;

    @ApiProperty({ enum: SubscriptionType, description: 'Subscription type' })
    @IsDefined()
    @IsEnum(SubscriptionType)
    readonly type!: SubscriptionType;

    @ApiProperty({ enum: BillingCycle, description: 'Billing cycle' })
    @IsDefined()
    @IsEnum(BillingCycle)
    readonly billingCycle!: BillingCycle;

    @ApiProperty({ description: 'Subscription price' })
    @IsDefined()
    @IsNumber()
    readonly price!: number;

    @ApiProperty({ description: 'Currency code' })
    @IsDefined()
    @IsString()
    readonly currency!: string;

    @ApiProperty({ enum: SubscriptionStatus, description: 'Subscription status' })
    @IsDefined()
    @IsEnum(SubscriptionStatus)
    readonly status!: SubscriptionStatus;

    @ApiProperty({ description: 'Effect ID', required: false })
    @IsOptional()
    @IsString()
    readonly effectId?: string;

    @ApiProperty({ description: 'Subscription start date' })
    @IsDefined()
    @IsDateString()
    readonly startDate!: Date;

    @ApiProperty({ description: 'Subscription end date', required: false })
    @IsOptional()
    @IsDateString()
    readonly endDate?: Date;

    @ApiProperty({ description: 'Next billing date' })
    @IsDefined()
    @IsDateString()
    readonly nextBillingDate!: Date;

    @ApiProperty({ description: 'Trial end date', required: false })
    @IsOptional()
    @IsDateString()
    readonly trialEndDate?: Date;

    @ApiProperty({ description: 'Cancelled at date', required: false })
    @IsOptional()
    @IsDateString()
    readonly cancelledAt?: Date;

    @ApiProperty({ description: 'Paused at date', required: false })
    @IsOptional()
    @IsDateString()
    readonly pausedAt?: Date;

    @ApiProperty({ description: 'Additional metadata', required: false })
    @IsOptional()
    @IsObject()
    readonly metadata?: Record<string, any>;

    @ApiProperty({ description: 'Created date' })
    @IsDefined()
    @IsDateString()
    readonly createdDate!: Date;

    @ApiProperty({ description: 'Updated date' })
    @IsDefined()
    @IsDateString()
    readonly updatedDate!: Date;
}

export class ActiveSubscriptionResponseDTO extends SubscriptionResponseDTO {
    @ApiProperty({ description: 'Whether the subscription is currently active' })
    @IsDefined()
    readonly isActive!: boolean;

    @ApiProperty({ description: 'Days until next billing', required: false })
    @IsOptional()
    @IsNumber()
    readonly daysUntilNextBilling?: number;

    @ApiProperty({ description: 'Effect details if subscription has an effect', required: false })
    @IsOptional()
    readonly effect?: any;
}
