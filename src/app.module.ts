import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ReceiptModule } from './managers/recieptManager/receipt.module';
import { ApiModule } from './managers/apiManager/api.module';
@Module({
    imports: [ReceiptModule, ApiModule],
    controllers: [AppController],
    providers: [],
})
export class ApplicationModule {
    constructor() {}
}
