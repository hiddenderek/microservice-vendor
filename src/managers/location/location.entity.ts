import { LocationType } from './types';

export class LocationEntity {
    locationId!: string;
    combinationId?: string;
    type!: LocationType;
    vendorId!: string;
    latitude?: number;
    longitude?: number;
    createdDate!: Date;
    updatedDate!: Date;

    constructor(init: Partial<LocationEntity>) {
        Object.assign(this, init);
    }
}
