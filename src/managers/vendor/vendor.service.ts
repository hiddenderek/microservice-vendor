import { Injectable } from '@nestjs/common';
import { DatabaseHelper } from '../../lib/databaseHelper';
import { VendorDataService } from './vendorData.service';
import { Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { VendorEntity } from './vendor.entity';
import type { VendorRequestDTO, VendorResponseDTO } from './vendor.dto';
import { LocationService } from '../location/location.service';
import { LocationEntity } from '../location/location.entity';

@Injectable()
export class VendorService extends DatabaseHelper<VendorEntity> {
    private readonly logger = new Logger(VendorService.name);

    constructor(
        private readonly vendorDataService: VendorDataService,
        private readonly locationService: LocationService,
    ) {
        super();
    }

    async createVendor({
        name,
        type,
        location,
        locationCombinations,
    }: VendorRequestDTO): Promise<VendorResponseDTO | null> {
        const vendor = new VendorEntity({
            name,
            type,
            vendorId: uuidv4(),
            createdDate: new Date(),
            updatedDate: new Date(),
        });

        const newVendor = await this.vendorDataService.postVendor(vendor);

        let newLocation: LocationEntity | null = null;

        if (location) {
            newLocation = await this.locationService.postLocation(location, newVendor.vendorId);
        } else if (locationCombinations) {
            const { locationCombination } = await this.locationService.postLocationCombination(
                locationCombinations ?? [],
                newVendor.vendorId,
            );

            newLocation = locationCombination;
        } else {
            newLocation = await this.locationService.postLocation();
        }

        return { ...newVendor, location: newLocation };
    }

    async getVendorById(vendorId: string): Promise<VendorEntity | null> {
        this.logger.log('Getting vendor...');

        const test = (await this.vendorDataService.getVendor({ vendorId }))?.[0] ?? null;

        return test;
    }

    async getVendorMetrics(vendorId: string): Promise<VendorEntity | null> {
        this.logger.log('Getting vendor...');

        return (await this.vendorDataService.getVendor({ vendorId })?.[0]) ?? null;
    }
}
