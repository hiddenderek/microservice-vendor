import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { AuthMiddleware } from '../../auth.middleware';
import { CatalogDataService } from './catalogData.service';
import { LocationModule } from '../location/location.module';

@Module({
    imports: [LocationModule],
    providers: [CatalogService, CatalogDataService],
    controllers: [CatalogController],
})
export class CatalogModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes('catalog');
    }
}
