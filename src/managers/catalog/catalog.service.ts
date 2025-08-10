import { Inject, Injectable } from '@nestjs/common';
import { DatabaseHelper } from '../../lib/databaseHelper';
import { CatalogDataService } from './catalogData.service';
import { Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CatalogEntity, CatalogItemEntity, CatalogSelectionEntity } from './catalog.entity';
import type { CreateCatalogRequestDTO, CatalogResponseDTO } from './catalog.dto';
import { REQUEST } from '@nestjs/core';
import { LocationDataService } from '../location/locationData.service';
import { LocationType } from '../location/types';
import { LocationService } from '../location/location.service';

@Injectable()
export class CatalogService extends DatabaseHelper<CatalogEntity> {
    private readonly logger = new Logger(CatalogService.name);
    private readonly vendorId;

    constructor(
        private readonly catalogDataService: CatalogDataService,
        private readonly locationService: LocationService,
        @Inject(REQUEST) private readonly request: any,
    ) {
        super();

        this.vendorId = this.request.user.vendorId;
    }

    async createCatalog(data: CreateCatalogRequestDTO): Promise<CatalogResponseDTO> {
        const { name, type, locationId, items } = data;

        let catalogId = uuidv4();

        const catalog = new CatalogEntity({
            catalogId,
            vendorId: this.vendorId,
            name,
            type,
            locationId,
            createdDate: new Date(),
            updatedDate: new Date(),
        });

        const result = await this.catalogDataService.postCatalog(catalog);

        const [...itemEntities] = await Promise.all(
            items.map(({ name, type, price, details }) => {
                const catalogItem = new CatalogItemEntity({
                    catalogItemId: uuidv4(),
                    vendorId: this.vendorId,
                    name,
                    type,
                    price,
                    details,
                    createdDate: new Date(),
                    updatedDate: new Date(),
                });

                return this.catalogDataService.postCatalogItem(catalogItem);
            }),
        );

        await Promise.all(
            itemEntities.map(({ catalogItemId }) => {
                const catalogSelection = new CatalogSelectionEntity({
                    catalogSelectionId: uuidv4(),
                    catalogItemId,
                    catalogId,
                });

                return this.catalogDataService.postCatalogSelection(catalogSelection);
            }),
        );

        return { ...(result as CatalogEntity), items: itemEntities };
    }

    async getCatalogById(catalogId: string): Promise<CatalogResponseDTO | null> {
        return (
            (await this.catalogDataService.getCatalog({ catalogId }, this.vendorId))?.[0] ?? null
        );
    }

    async getCatalogByLocation(locationId: string): Promise<CatalogResponseDTO | null> {
        const locationChecks = this.locationService.getPrioritizedLocations(locationId);

        for (const locationCheck of locationChecks) {
            const locationId = await locationCheck();

            if (!locationId) continue;

            const catalog =
                (await this.catalogDataService.getCatalog({ locationId }, this.vendorId))?.[0] ??
                null;

            if (catalog) {
                return catalog;
            }
        }

        this.logger.warn(`Location not found for vendor ${this.vendorId}`);

        return null;
    }
}
