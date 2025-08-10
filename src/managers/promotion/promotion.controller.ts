import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PromotionService } from './promotion.service';
import { CreatePromotionRequestDTO } from './promotion.dto';

@Controller('promotion')
@ApiTags('promotion')
@ApiBearerAuth()
export class PromotionController {
    constructor(private readonly promotionService: PromotionService) {}

    @Post('')
    @ApiOperation({ summary: 'Create a promotion with an effect' })
    @ApiResponse({ status: 201, description: 'Promotion with effect created successfully' })
    async createPromotion(@Body() body: CreatePromotionRequestDTO) {
        return await this.promotionService.createPromotion(body);
    }

    @Get(':vendorId')
    @ApiOperation({ summary: 'Get promotions by vendor ID' })
    @ApiResponse({ status: 200, description: 'Promotions retrieved successfully' })
    async getPromotions(@Param('vendorId') vendorId: string) {
        return await this.promotionService.getPromotionsByVendor(vendorId);
    }

    @Get('active/:vendorId')
    @ApiOperation({ summary: 'Get active promotions by vendor ID with effect details' })
    @ApiResponse({ status: 200, description: 'Active promotions retrieved successfully' })
    async getActivePromotions(@Param('vendorId') vendorId: string) {
        return await this.promotionService.getActivePromotions(vendorId);
    }

    @Get('detail/:promotionId')
    @ApiOperation({ summary: 'Get promotion by ID' })
    @ApiResponse({ status: 200, description: 'Promotion retrieved successfully' })
    async getPromotion(@Param('promotionId') promotionId: string) {
        return await this.promotionService.getPromotionById(promotionId);
    }
}
