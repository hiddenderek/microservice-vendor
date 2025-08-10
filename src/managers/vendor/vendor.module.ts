import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { VendorController } from './vendor.controller';
import { VendorService } from './vendor.service';
import { AuthMiddleware } from '../../auth.middleware';
import { VendorDataService } from './vendorData.service';
import { LocationDataService } from '../location/locationData.service';
import { LocationModule } from '../location/location.module';

@Module({
    imports: [LocationModule],
    providers: [VendorService, VendorDataService],
    controllers: [VendorController],
})
export class VendorModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes('vendor');
    }
}
