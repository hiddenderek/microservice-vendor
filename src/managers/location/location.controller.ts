import { Controller, Post, Body } from '@nestjs/common';
import { LocationService } from './location.service';
import {
    LocationCombinationCreateRequestDTO,
    LocationCombinationResponseDTO,
    LocationCreateRequestDTO,
} from './location.dto';
import { LocationEntity } from './location.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('location')
@Controller('location')
export class LocationController {
    constructor(private readonly locationService: LocationService) {}

    @ApiOperation({ summary: 'Create a new location' })
    @ApiResponse({ status: 201, description: 'Location created' })
    @Post('')
    async createLocation(@Body() body: LocationCreateRequestDTO): Promise<LocationEntity | null> {
        const { latitude, longitude } = body;
    
        if (location) {
            return await this.locationService.postLocation({ latitude, longitude });
        }

        return null;
    }

    @ApiOperation({ summary: 'Create a new location combination' })
    @ApiResponse({ status: 201, description: 'Location combination created' })
    @Post('combination')
    async createLocationCombination(
        @Body() body: LocationCombinationCreateRequestDTO,
    ): Promise<LocationCombinationResponseDTO | null> {
        const { locationCombinations, combinationId } = body;

        if (locationCombinations) {
            return await this.locationService.postLocationCombination(
                locationCombinations,
                combinationId,
            );
        }

        return null;
    }
}
