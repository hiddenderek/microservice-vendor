import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionDataService } from './subscriptionData.service';
import { EffectModule } from '../effect/effect.module';
import { AuthMiddleware } from '../../auth.middleware';

@Module({
    imports: [EffectModule],
    providers: [SubscriptionService, SubscriptionDataService],
    controllers: [SubscriptionController],
    exports: [SubscriptionService],
})
export class SubscriptionModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes('subscription');
    }
}
