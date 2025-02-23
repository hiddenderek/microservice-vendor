import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TestController } from './receipt.controller';
import { ReceiptService } from './receipt.service';
import { AuthMiddleware } from '../../auth.middleware';
import { ReceiptDataService } from './receiptData.service';

@Module({
    imports: [],
    providers: [
        ReceiptService,
        ReceiptDataService
    ],
    controllers: [TestController],
})
export class ReceiptModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes({ path: 'tests', method: RequestMethod.GET });
    }
}
