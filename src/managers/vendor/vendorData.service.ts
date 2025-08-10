import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DatabaseHelper } from '../../lib/databaseHelper';
import { hasDefinedProperties } from '../../lib/hasDefinedProperties';
import { concatSql, joinSql, rawText, sql } from '../../lib/sqlTag';
import { VendorEntity } from './vendor.entity';

@Injectable()
export class VendorDataService extends DatabaseHelper<VendorEntity> {
    readonly tableName = 'vendor';

    constructor() {
        super();
    }

    async getVendor({
        vendorId,
        name,
        type,
    }: Partial<VendorEntity>): Promise<VendorEntity[] | null> {
        const query = hasDefinedProperties(test)
            ? concatSql(
                  `WHERE`,
                  joinSql(
                      [
                          vendorId ? sql`vendor_id = ${vendorId}` : undefined,
                          name ? sql`name = ${name}` : undefined,
                          type ? sql`type = ${type}` : undefined,
                      ],
                      ' AND ',
                  ),
              )
            : undefined;

        const result = await this.select({ query });

        if (result) {
            return result;
        }

        return null;
    }

    async postVendor(vendor: VendorEntity): Promise<VendorEntity> {
        return await this.insert({ postObject: vendor });
    }
}
