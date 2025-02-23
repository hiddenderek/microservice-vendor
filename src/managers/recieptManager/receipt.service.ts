import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Receipt } from './receipt.dto';
import { DatabaseHelper } from '../../lib/databaseHelper';
import { ApiService } from '../apiManager/api.service';
import { ReceiptDataService } from './receiptData.service';
import { Logger } from "@nestjs/common"

@Injectable()
export class ReceiptService extends DatabaseHelper<Receipt> {
    private readonly logger = new Logger(ReceiptService.name);

    constructor(private readonly ApiService: ApiService, private readonly receiptService: ReceiptDataService) {
        super();
    }

    async processReceipt(data: Receipt) {
        try {
            this.logger.log('Processing receipt...');
            const result = await this.receiptService.postReceipt(data);
            return result;
        } catch (error) {
            const messsage = 'Error processing receipt';
            this.logger.error(messsage, error);
            throw new InternalServerErrorException(messsage, {
                cause: error,
                description: error?.code,
            });
        }
    }

    async getReceipt(receiptId: string): Promise<Receipt | null> {
        try {
            this.logger.log('Getting receipt...'); 
            return await this.receiptService.getReceipt(receiptId);
        } catch (error) {
            throw new InternalServerErrorException('Error finding test data', {
                cause: error,
                description: error?.code,
            });
        }
    }
}
