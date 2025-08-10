import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsEnum,
    IsDefined,
    IsNumber,
    IsOptional,
    IsArray,
    IsDateString,
} from 'class-validator';
import { DiscountType } from './types';

export class CreatePromotionRequestDTO {
    @ApiProperty({ description: 'Promotion name' })
    @IsDefined()
    @IsString()
    readonly name!: string;

    @ApiProperty({ description: 'Promotion description', required: false })
    @IsOptional()
    @IsString()
    readonly description?: string;

    @ApiProperty({ description: 'Effect ID to apply to this promotion' })
    @IsDefined()
    @IsString()
    readonly effectId!: string;

    @ApiProperty({ description: 'Promotion start date' })
    @IsDefined()
    @IsDateString()
    readonly startDate!: Date;

    @ApiProperty({ description: 'Promotion end date' })
    @IsDefined()
    @IsDateString()
    readonly endDate!: Date;

    @ApiProperty({ description: 'Menu item IDs', type: [String] })
    @IsDefined()
    @IsArray()
    @IsString({ each: true })
    readonly menuItemIds!: string[];
}

export class PromotionResponseDTO {
    @ApiProperty({ description: 'Promotion ID' })
    @IsDefined()
    @IsString()
    readonly promotionId!: string;

    @ApiProperty({ description: 'Vendor ID' })
    @IsDefined()
    @IsString()
    readonly vendorId!: string;

    @ApiProperty({ description: 'Promotion name' })
    @IsDefined()
    @IsString()
    readonly name!: string;

    @ApiProperty({ description: 'Promotion description', required: false })
    @IsOptional()
    @IsString()
    readonly description?: string;

    @ApiProperty({ enum: DiscountType, description: 'Discount type', required: false })
    @IsOptional()
    @IsEnum(DiscountType)
    readonly discountType?: DiscountType;

    @ApiProperty({ description: 'Discount value', required: false })
    @IsOptional()
    @IsNumber()
    readonly discountValue?: number;

    @ApiProperty({ description: 'Effect ID', required: false })
    @IsOptional()
    @IsString()
    readonly effectId?: string;

    @ApiProperty({ description: 'Promotion start date' })
    @IsDefined()
    @IsDateString()
    readonly startDate!: Date;

    @ApiProperty({ description: 'Promotion end date' })
    @IsDefined()
    @IsDateString()
    readonly endDate!: Date;

    @ApiProperty({ description: 'Menu item IDs', type: [String] })
    @IsDefined()
    @IsArray()
    @IsString({ each: true })
    readonly menuItemIds!: string[];

    @ApiProperty({ description: 'Created date' })
    @IsDefined()
    @IsDateString()
    readonly createdDate!: Date;

    @ApiProperty({ description: 'Updated date' })
    @IsDefined()
    @IsDateString()
    readonly updatedDate!: Date;
}

export class ActivePromotionResponseDTO extends PromotionResponseDTO {
    @ApiProperty({ description: 'Whether the promotion is currently active' })
    @IsDefined()
    readonly isActive!: boolean;

    @ApiProperty({ description: 'Effect details if promotion has an effect', required: false })
    @IsOptional()
    readonly effect?: any;
}
