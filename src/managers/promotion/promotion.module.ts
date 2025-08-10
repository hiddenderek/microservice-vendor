import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { PromotionController } from './promotion.controller';
import { PromotionDataService } from './promotionData.service';
import { EffectModule } from '../effect/effect.module';
import { AuthMiddleware } from '../../auth.middleware';

@Module({
    imports: [EffectModule],
    providers: [PromotionService, PromotionDataService],
    controllers: [PromotionController],
})
export class PromotionModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes('promotion');
    }
}
