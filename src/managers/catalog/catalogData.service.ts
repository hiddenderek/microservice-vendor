import { Injectable } from '@nestjs/common';
import { DatabaseHelper } from '../../lib/databaseHelper';
import { concatSql, joinSql, sql } from '../../lib/sqlTag';
import type { CatalogEntity, CatalogItemEntity, CatalogSelectionEntity } from './catalog.entity';
import type { CatalogResponseDTO } from './catalog.dto';

@Injectable()
export class CatalogDataService extends DatabaseHelper<CatalogEntity> {
    readonly tableName = 'catalog';

    constructor() {
        super();
    }

    async getCatalog(
        { catalogId, name, type, locationId }: Partial<CatalogEntity>,
        vendorId: string,
    ): Promise<CatalogResponseDTO[] | null> {
        const query = concatSql(
            `SELECT 
                c.catalog_id,
                c.vendor_id,
                c.location_id,
                c.name,
                c.type,
                json_agg(
                    json_build_object(
                        'catalog_item_id', ci.catalog_item_id,
                        'vendor_id', ci.vendor_id,
                        'name', ci.name,
                        'price', ci.price,
                        'price_unit', ci.price_unit,
                        'type', ci.type,
                        'created_date', ci.created_date,
                        'updated_date', ci.updated_date
                    )
                ) AS items,
                c.created_date,
                c.updated_date

                FROM ${this.tableName} c
            `,
            catalogId
                ? sql`LEFT JOIN catalog_selection cs ON cs.catalog_id = ${catalogId}`
                : sql`LEFT JOIN catalog_selection cs ON cs.catalog_id = c.catalog_id`,
            `LEFT JOIN catalog_item ci ON cs.catalog_item_id = ci.catalog_item_id
                WHERE
            `,
            joinSql(
                [
                    sql`c.vendor_id = ${vendorId}`,
                    catalogId ? sql`c.catalog_id = ${catalogId}` : undefined,
                    name ? sql`c.name = ${name}` : undefined,
                    type ? sql`c.type = ${type}` : undefined,
                    locationId ? sql`c.location_id = ${locationId}` : undefined,
                ],
                ` AND 
                `,
            ),
            `GROUP BY
                c.catalog_id,
                c.vendor_id,
                c.location_id,
                c.name,
                c.type,
                c.created_date,
                c.updated_date
            `,
        );

        const result = await this.execute<CatalogResponseDTO>({ query });

        if (result) {
            return result;
        }

        return null;
    }

    async postCatalog(catalog: CatalogEntity): Promise<CatalogEntity> {
        return await this.insert({ postObject: catalog });
    }

    async postCatalogItem(catalogItem: CatalogItemEntity): Promise<CatalogItemEntity> {
        return await this.insert({ postObject: catalogItem, tableName: 'catalog_item' });
    }

    async postCatalogSelection(
        catalogSelection: CatalogSelectionEntity,
    ): Promise<CatalogSelectionEntity> {
        return await this.insert({ postObject: catalogSelection, tableName: 'catalog_selection' });
    }
}
