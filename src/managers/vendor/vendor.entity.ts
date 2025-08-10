import { VendorType } from './types';

export class VendorEntity {
    vendorId: string;
    name: string;
    type: VendorType;
    createdDate: Date;
    updatedDate: Date;

    constructor(data: VendorEntity) {
        this.vendorId = data.vendorId;
        this.name = data.name;
        this.type = data.type;
        this.createdDate = data.createdDate;
        this.updatedDate = data.updatedDate;
    }
}
