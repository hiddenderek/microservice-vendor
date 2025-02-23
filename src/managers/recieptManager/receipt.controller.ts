import {
    Get,
    Query,
    Controller,
    InternalServerErrorException,
    Inject,
    Post,
    Body,
} from '@nestjs/common';
import { ReceiptService } from './receipt.service';
import { Receipt } from './receipt.dto';
import { ApiBearerAuth, ApiResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { REQUEST } from '@nestjs/core';

@ApiBearerAuth()
@ApiTags('test')
@Controller('receipts')
export class TestController {
    constructor(private readonly receiptService: ReceiptService, @Inject(REQUEST) private readonly request: { token: string }) {}

    @ApiOperation({ summary: 'Gets test data' })
    @ApiResponse({ status: 200, description: 'Returns test data' })
    @Post('/process')
    async processReceipt(
        @Body() body: Receipt,
    ): Promise<Receipt | null> {
        try {
            return await this.receiptService.processReceipt(body);
        } catch (e) {
            console.log(e);
            throw new InternalServerErrorException(e, 'Unknown Error');
        }
    }

    @ApiOperation({ summary: 'Gets test data' })
    @ApiResponse({ status: 200, description: 'Returns test data' })
    @Get('/:receiptid/points')
    async getReceipt(
        @Query('receiptid') receiptId: string,
    ): Promise<Receipt | null> {
        try {
            return await this.receiptService.getReceipt(receiptId);
        } catch (e) {
            console.log(e);
            throw new InternalServerErrorException(e, 'Unknown Error');
        }
    }
    
}
