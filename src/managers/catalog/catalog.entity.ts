import { CatalogType, PriceUnit } from './types';

export class CatalogEntity {
    catalogId: string;
    vendorId: string;
    name: string;
    type: CatalogType;
    locationId: string;
    createdDate: Date;
    updatedDate: Date;

    constructor(data: CatalogEntity) {
        this.catalogId = data?.catalogId;
        this.vendorId = data?.vendorId;
        this.name = data?.name;
        this.type = data?.type;
        this.locationId = data?.locationId;
        this.createdDate = data?.createdDate;
        this.updatedDate = data?.updatedDate;
    }
}

export class CatalogSelectionEntity {
    catalogSelectionId: string;
    catalogId: string;
    catalogItemId: string;

    constructor(data: CatalogSelectionEntity) {
        this.catalogSelectionId = data.catalogSelectionId;
        this.catalogId = data.catalogId;
        this.catalogItemId = data.catalogItemId;
    }
}

export class CatalogItemEntity {
    catalogItemId!: string;
    vendorId!: string;
    type!: string;
    name!: string;
    price!: number;
    priceUnit?: PriceUnit;
    details?: Record<string, any>;
    createdDate!: Date;
    updatedDate!: Date;

    constructor(data: Partial<CatalogItemEntity>) {
        Object.assign(this, data);
        this.priceUnit = this.priceUnit ?? PriceUnit.USD;
    }
}
