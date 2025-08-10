// ...existing code...
import { Get, Controller, Post, Body, Param } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { CreateCatalogRequestDTO, CatalogResponseDTO } from './catalog.dto';
import { ApiBearerAuth, ApiResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('catalog')
@Controller('catalog')
export class CatalogController {
    constructor(private readonly catalogService: CatalogService) {}

    @ApiOperation({ summary: 'Creates a catalog' })
    @ApiResponse({ status: 200, description: 'Returns created catalog data' })
    @Post('')
    async createCatalog(@Body() body: CreateCatalogRequestDTO): Promise<CatalogResponseDTO> {
        return await this.catalogService.createCatalog(body);
    }

    @ApiOperation({ summary: 'Gets catalog by catalog id' })
    @ApiResponse({ status: 200, description: 'Returns catalog data' })
    @Get('/:catalogId')
    async getCatalogById(
        @Param('catalogId') catalogId: string,
    ): Promise<CatalogResponseDTO | null> {
        return await this.catalogService.getCatalogById(catalogId);
    }

    @ApiOperation({ summary: 'Gets catalog by location id' })
    @ApiResponse({ status: 200, description: 'Returns catalog data' })
    @Get('/location/:locationId')
    async getCatalogByLocation(
        @Param('locationId') locationId: string,
    ): Promise<CatalogResponseDTO | null> {
        return await this.catalogService.getCatalogByLocation(locationId);
    }
}
