import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LocationDataService } from './locationData.service';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { AuthMiddleware } from '../../auth.middleware';

@Module({
    providers: [LocationDataService, LocationService],
    exports: [LocationDataService, LocationService],
    controllers: [LocationController],
})
export class LocationModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes('location');
    }
}
