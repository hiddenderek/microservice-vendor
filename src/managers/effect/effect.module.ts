import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthMiddleware } from '../../auth.middleware';
import { EffectDataService } from './effectData.service';
import { EffectService } from './effect.service';
import { EffectController } from './effect.controller';
import { LocationModule } from '../location/location.module';
import { ConditionModule } from '../condition/condition.module';

@Module({
    imports: [LocationModule, ConditionModule],
    providers: [EffectDataService, EffectService],
    exports: [EffectDataService, EffectService],
    controllers: [EffectController],
})
export class EffectModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes('effect');
    }
}
