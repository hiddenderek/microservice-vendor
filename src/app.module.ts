import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { VendorModule } from './managers/vendor/vendor.module';
import { CatalogModule } from './managers/catalog/catalog.module';
import { LocationModule } from './managers/location/location.module';
import { EffectModule } from './managers/effect/effect.module';
import { SubscriptionModule } from './managers/subscription/subscription.module';
import { PromotionModule } from './managers/promotion/promotion.module';
@Module({
    imports: [VendorModule, CatalogModule, LocationModule, EffectModule, PromotionModule, SubscriptionModule],
    controllers: [AppController],
    providers: [],
})
export class ApplicationModule {
    constructor() {}
}
