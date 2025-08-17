import { Get, Controller, InternalServerErrorException, Post, Body, Param } from '@nestjs/common';
import { VendorService } from './vendor.service';
import type { VendorRequestDTO, VendorResponseDTO } from './vendor.dto';
import { ApiBearerAuth, ApiResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { VendorEntity } from './vendor.entity';

@ApiBearerAuth()
@ApiTags('vendor')
@Controller('vendor')
export class VendorController {
    constructor(private readonly vendorService: VendorService) {}

    @ApiOperation({ summary: 'Creates a vendor' })
    @ApiResponse({ status: 200, description: 'Returns created vendor data' })
    @Post('')
    async createVendor(@Body() body: VendorRequestDTO): Promise<VendorResponseDTO | null> {
        try {
            return await this.vendorService.createVendor(body);
        } catch (e) {
            throw new InternalServerErrorException(e, 'Unknown Error');
        }
    }

    @ApiOperation({ summary: 'Gets vendor by vendor id' })
    @ApiResponse({ status: 200, description: 'Returns vendor data' })
    @Get('/:vendorId')
    async getVendor(@Param('vendorId') vendorId: string): Promise<VendorEntity | null> {
        try {
            return await this.vendorService.getVendorById(vendorId);
        } catch (e) {
            throw new InternalServerErrorException(e, 'Unknown Error');
        }
    }

    @ApiOperation({ summary: 'Gets vendor metrics' })
    @ApiResponse({ status: 200, description: 'Returns vendor data' })
    @Get('/:vendorId/metrics')
    async getVendorMetrics(@Param('vendorId') vendorId: string): Promise<VendorEntity | null> {
        try {
            return await this.vendorService.getVendorMetrics(vendorId);
        } catch (e) {
            throw new InternalServerErrorException(e, 'Unknown Error');
        }
    }
}
