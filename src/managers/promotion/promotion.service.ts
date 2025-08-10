import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PromotionEntity } from './promotion.entity';
import type { CreatePromotionRequestDTO, PromotionResponseDTO, ActivePromotionResponseDTO } from './promotion.dto';
import { REQUEST } from '@nestjs/core';
import { PromotionDataService } from './promotionData.service';
import { EffectService } from '../effect/effect.service';

@Injectable()
export class PromotionService {
    private readonly vendorId;

    constructor(
        private readonly promotionDataService: PromotionDataService,
        private readonly effectService: EffectService,
        @Inject(REQUEST) private readonly request: any,
    ) {
        this.vendorId = this.request.user.vendorId;
    }

    async createPromotion(data: CreatePromotionRequestDTO): Promise<PromotionResponseDTO> {
        const promotion = new PromotionEntity({
            ...data,
            promotionId: uuidv4(),
            vendorId: this.vendorId,
            createdDate: new Date(),
            updatedDate: new Date(),
        });

        return await this.promotionDataService.postPromotion(promotion);
    }

    async getPromotionsByVendor(vendorId: string): Promise<PromotionResponseDTO[]> {
        return await this.promotionDataService.getPromotionsByVendor(vendorId);
    }

    async getPromotionById(promotionId: string): Promise<PromotionResponseDTO | null> {
        return await this.promotionDataService.getPromotionById(promotionId);
    }

    async getActivePromotions(vendorId: string): Promise<ActivePromotionResponseDTO[]> {
        const promotions = await this.promotionDataService.getPromotionsByVendor(vendorId);
        const now = new Date();

        const activePromotionPromises = promotions.map(async (promotion) => {
            const isActive = new Date(promotion.startDate) <= now && new Date(promotion.endDate) >= now;
            
            let effect: any = null;
            if (isActive && promotion.effectId) {
                try {
                    effect = await this.effectService.getEffect(promotion.effectId);
                } catch (error) {
                    console.error(`Failed to fetch effect ${promotion.effectId}:`, error);
                }
            }

            return {
                ...promotion,
                isActive,
                effect,
            } as ActivePromotionResponseDTO;
        });

        const activePromotions = await Promise.all(activePromotionPromises);
        
        // Only return promotions that are currently active
        return activePromotions.filter(promotion => promotion.isActive);
    }
}
