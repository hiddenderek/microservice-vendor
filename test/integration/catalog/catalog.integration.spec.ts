import jwt from 'jwt-simple';
import tokenBody from '../../fixtures/tokenBody.json';
import { mockRequest, setupTest } from '../testHelpers';
import { CatalogType, PriceUnit } from '../../../src/managers/catalog/types';

const token = jwt.encode(tokenBody, 'test');

describe('catalog', () => {
    setupTest(['catalog', 'catalog_item', 'catalog_selection']);

    it('should post catalog data', async () => {
        const result = await mockRequest({
            path: `/catalog`,
            action: 'post',
            body: {
                name: 'vendor_catalog',
                type: CatalogType.Food,
                locationId: 'mock-location-id',
                items: [
                    {
                        type: 'test',
                        name: 'test-name',
                        price: 123,
                    },
                ],
            },
            token,
        });

        expect(result.body).toEqual(
            expect.objectContaining({
                name: 'vendor_catalog',
                type: CatalogType.Food,
                catalogId: expect.any(String),
                locationId: 'mock-location-id',
                items: [
                    {
                        catalogItemId: expect.any(String),
                        vendorId: expect.any(String),
                        type: 'test',
                        name: 'test-name',
                        price: 123,
                        priceUnit: PriceUnit.USD,
                        details: null,
                        createdDate: expect.any(String),
                        updatedDate: expect.any(String),
                    },
                ],
                createdDate: expect.any(String),
                updatedDate: expect.any(String),
            }),
        );
    });

    it('should get catalog data', async () => {
        const postResult = await mockRequest({
            path: `/catalog`,
            action: 'post',
            body: {
                name: 'vendor_catalog',
                type: CatalogType.Food,
                locationId: 'mock-location-id',
                items: [
                    {
                        type: 'test',
                        name: 'test-name',
                        price: 123,
                    },
                ],
            },
            token,
        });

        const result = await mockRequest({
            path: `/catalog/${postResult.body.catalogId}`,
            action: 'get',
            token,
        });

        expect(result.body).toEqual(
            expect.objectContaining({
                name: 'vendor_catalog',
                type: CatalogType.Food,
                catalogId: expect.any(String),
                locationId: 'mock-location-id',
                items: [
                    {
                        catalogItemId: expect.any(String),
                        vendorId: expect.any(String),
                        type: 'test',
                        name: 'test-name',
                        price: 123,
                        priceUnit: PriceUnit.USD,
                        createdDate: expect.any(String),
                        updatedDate: expect.any(String),
                    },
                ],
                createdDate: expect.any(String),
                updatedDate: expect.any(String),
            }),
        );
    });

    it('should get catalog data for a location', async () => {
        await mockRequest({
            path: `/catalog`,
            action: 'post',
            body: {
                name: 'vendor_catalog',
                type: CatalogType.Food,
                locationId: 'mock-location-id',
                items: [
                    {
                        type: 'test',
                        name: 'test-name',
                        price: 123,
                    },
                ],
            },
            token,
        });

        const result = await mockRequest({
            path: `/catalog/location/mock-location-id`,
            action: 'get',
            token,
        });

        expect(result.body).toEqual(
            expect.objectContaining({
                name: 'vendor_catalog',
                type: CatalogType.Food,
                catalogId: expect.any(String),
                locationId: 'mock-location-id',
                items: [
                    {
                        catalogItemId: expect.any(String),
                        vendorId: expect.any(String),
                        type: 'test',
                        name: 'test-name',
                        price: 123,
                        priceUnit: PriceUnit.USD,
                        createdDate: expect.any(String),
                        updatedDate: expect.any(String),
                    },
                ],
                createdDate: expect.any(String),
                updatedDate: expect.any(String),
            }),
        );
    });

    it('should fall back to global catalog data', async () => {
        await mockRequest({
            path: `/catalog`,
            action: 'post',
            body: {
                name: 'vendor_catalog',
                type: CatalogType.Food,
                locationId: 'mock-global-location-id',
                items: [
                    {
                        type: 'test',
                        name: 'test-name',
                        price: 123,
                    },
                ],
            },
            token,
        });

        const result = await mockRequest({
            path: `/catalog/location/mock-location-id`,
            action: 'get',
            token,
        });

        expect(result.body).toEqual(
            expect.objectContaining({
                name: 'vendor_catalog',
                type: CatalogType.Food,
                catalogId: expect.any(String),
                locationId: 'mock-global-location-id',
                items: [
                    {
                        catalogItemId: expect.any(String),
                        vendorId: expect.any(String),
                        type: 'test',
                        name: 'test-name',
                        price: 123,
                        priceUnit: PriceUnit.USD,
                        createdDate: expect.any(String),
                        updatedDate: expect.any(String),
                    },
                ],
                createdDate: expect.any(String),
                updatedDate: expect.any(String),
            }),
        );
    });

    it('should fall back to combination catalog data', async () => {
        const response = await mockRequest({
            path: `/location/combination`,
            action: 'post',
            body: {
                locationCombinations: [
                    {
                        longitude: 123.456,
                        latitude: 78.9,
                    },
                ],
            },
            token,
        });

        const { locationCombination, items } = response.body;

        await mockRequest({
            path: `/catalog`,
            action: 'post',
            body: {
                name: 'vendor_catalog',
                type: CatalogType.Food,
                locationId: locationCombination.locationId,
                items: [
                    {
                        type: 'test',
                        name: 'test-name',
                        price: 123,
                    },
                ],
            },
            token,
        });

        const result = await mockRequest({
            path: `/catalog/location/${items[0].locationId}`,
            action: 'get',
            token,
        });

        expect(result.body).toEqual(
            expect.objectContaining({
                name: 'vendor_catalog',
                type: CatalogType.Food,
                catalogId: expect.any(String),
                locationId: locationCombination.locationId,
                items: [
                    {
                        catalogItemId: expect.any(String),
                        vendorId: expect.any(String),
                        type: 'test',
                        name: 'test-name',
                        price: 123,
                        priceUnit: PriceUnit.USD,
                        createdDate: expect.any(String),
                        updatedDate: expect.any(String),
                    },
                ],
                createdDate: expect.any(String),
                updatedDate: expect.any(String),
            }),
        );
    });
});
