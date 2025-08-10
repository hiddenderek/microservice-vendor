import { Injectable } from '@nestjs/common';
import { DatabaseHelper } from '../../lib/databaseHelper';
import { hasDefinedProperties } from '../../lib/hasDefinedProperties';
import { concatSql, joinSql, sql } from '../../lib/sqlTag';
import { LocationEntity } from './location.entity';
import { LocationType } from './types';
import { join } from 'sql-template-tag';

@Injectable()
export class LocationDataService extends DatabaseHelper<LocationEntity> {
    readonly tableName = 'location';

    constructor() {
        super();
    }

    async getLocation(
        { locationId, type }: Partial<LocationEntity>,
        vendorId: string,
    ): Promise<LocationEntity | null> {
        const query = hasDefinedProperties(test)
            ? concatSql(
                  `WHERE`,
                  joinSql(
                      [
                          locationId ? sql`location_id = ${locationId}` : undefined,
                          vendorId ? sql`vendor_id = ${vendorId}` : undefined,
                          type ? sql`type = ${type}` : undefined,
                      ],
                      ' AND ',
                  ),
              )
            : undefined;

        const result = await this.select({ query });

        if (result?.[0]) {
            return result[0];
        }

        return null;
    }

    async postLocation(location: LocationEntity): Promise<LocationEntity> {
        return await this.upsert({ postObject: location, conflictColumn: 'location_id' });
    }
}
