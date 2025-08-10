import { Inject, Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { REQUEST } from '@nestjs/core';
import { LocationDataService } from '../location/locationData.service';
import { LocationType } from '../location/types';
import { LocationEntity } from './location.entity';
import type { LocationCombinationResponseDTO, LocationRequestDTO } from './location.dto';

@Injectable()
export class LocationService {
    private readonly logger = new Logger(LocationService.name);
    private readonly vendorId;

    constructor(
        private readonly locationDataService: LocationDataService,
        @Inject(REQUEST) private readonly request: any,
    ) {
        this.vendorId = this.request.user.vendorId;
    }

    async postLocation(location?: LocationRequestDTO, vendorId?: string): Promise<LocationEntity> {
        const newLocation = new LocationEntity({
            locationId: uuidv4(),
            vendorId: vendorId ?? this.vendorId,
            latitude: location?.latitude,
            longitude: location?.longitude,
            type: location ? LocationType.Individual : LocationType.Global,
            createdDate: new Date(),
            updatedDate: new Date(),
        });

        return await this.locationDataService.postLocation(newLocation);
    }

    async postLocationCombination(
        locationCombinations: LocationRequestDTO[],
        combinationId?: string,
        vendorId?: string,
    ): Promise<LocationCombinationResponseDTO> {
        const combinations: LocationEntity[] = [];
        let locationCombination: LocationEntity | null = null;

        if (combinationId) {
            // Use existing parent combination
            locationCombination = await this.locationDataService.getLocation(
                { locationId: combinationId, type: LocationType.Combination },
                vendorId ?? this.vendorId,
            );
        }
        if (!locationCombination) {
            // Create the parent combination entity
            const newLocationCombination = new LocationEntity({
                locationId: uuidv4(),
                vendorId: vendorId ?? this.vendorId,
                type: LocationType.Combination,
                createdDate: new Date(),
                updatedDate: new Date(),
            });

            locationCombination =
                await this.locationDataService.postLocation(newLocationCombination);
        }

        for (const combination of locationCombinations) {
            // Create a new location as part of the combination
            const newLocationCombination = new LocationEntity({
                locationId: combination.locationId ?? uuidv4(),
                vendorId: vendorId ?? this.vendorId,
                combinationId: locationCombination.locationId,
                latitude: combination.latitude,
                longitude: combination.longitude,
                type: LocationType.Individual,
                createdDate: new Date(),
                updatedDate: new Date(),
            });

            const createdCombination =
                await this.locationDataService.postLocation(newLocationCombination);

            combinations.push(createdCombination);
        }

        return { locationCombination, items: combinations };
    }

    getPrioritizedLocations(locationId: string): Array<() => Promise<string | undefined>> {
        return [
            async () => {
                const loc = await this.locationDataService.getLocation(
                    { locationId, type: LocationType.Individual },
                    this.vendorId,
                );
                return loc?.locationId;
            },
            async () => {
                const loc = await this.locationDataService.getLocation(
                    { locationId, type: LocationType.Individual },
                    this.vendorId,
                );
                return loc?.combinationId;
            },
            async () => {
                const loc = await this.locationDataService.getLocation(
                    { type: LocationType.Global },
                    this.vendorId,
                );
                return loc?.locationId;
            },
        ];
    }
}
