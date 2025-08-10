import jwt from 'jwt-simple';
import tokenBody from '../../fixtures/tokenBody.json';

import { mockRequest } from '../testHelpers';
import { setupTest } from '../testHelpers';
import { LocationType } from '../../../src/managers/location/types';
import { VendorType } from '../../../src/managers/vendor/types';

const token = jwt.encode(tokenBody, 'test');

describe('vendor', () => {
    setupTest();

    it('should post vendor data', async () => {
        const result = await mockRequest({
            path: `/vendor`,
            action: 'post',
            body: {
                name: 'test_vendor',
                type: VendorType.Restaraunt,
                location: {
                    longitude: 123.456,
                    latitude: 78.9,
                },
            },
            token,
        });

        expect(result.body).toEqual({
            name: 'test_vendor',
            type: VendorType.Restaraunt,
            vendorId: expect.any(String),
            location: {
                locationId: expect.any(String),
                vendorId: expect.any(String),
                combinationId: null,
                latitude: 78.9,
                longitude: 123.456,
                type: LocationType.Individual,
                createdDate: expect.any(String),
                updatedDate: expect.any(String),
            },
            createdDate: expect.any(String),
            updatedDate: expect.any(String),
        });
    });

    it('should post vendor data - combination', async () => {
        const result = await mockRequest({
            path: `/vendor`,
            action: 'post',
            body: {
                name: 'test_vendor',
                type: VendorType.Restaraunt,
                locationCombinations: [
                    {
                        longitude: 123.456,
                        latitude: 78.9,
                    },
                    {
                        longitude: 123.456,
                        latitude: 78.9,
                    },
                ],
            },
            token,
        });

        expect(result.body).toEqual({
            name: 'test_vendor',
            type: VendorType.Restaraunt,
            vendorId: expect.any(String),
            location: {
                locationId: expect.any(String),
                vendorId: expect.any(String),
                combinationId: null,
                latitude: null,
                longitude: null,
                type: LocationType.Combination,
                createdDate: expect.any(String),
                updatedDate: expect.any(String),
            },
            createdDate: expect.any(String),
            updatedDate: expect.any(String),
        });
    });

    it('should post vendor data - global', async () => {
        const result = await mockRequest({
            path: `/vendor`,
            action: 'post',
            body: {
                name: 'test_vendor',
                type: VendorType.Restaraunt,
            },
            token,
        });

        expect(result.body).toEqual({
            name: 'test_vendor',
            type: VendorType.Restaraunt,
            vendorId: expect.any(String),
            location: {
                locationId: expect.any(String),
                vendorId: expect.any(String),
                combinationId: null,
                latitude: null,
                longitude: null,
                type: LocationType.Global,
                createdDate: expect.any(String),
                updatedDate: expect.any(String),
            },
            createdDate: expect.any(String),
            updatedDate: expect.any(String),
        });
    });

    it('should get vendor data', async () => {
        const result1 = await mockRequest({
            path: `/vendor`,
            action: 'post',
            body: {
                name: 'test_vendor',
                type: VendorType.Restaraunt,
                location: {
                    longitude: 123.456,
                    latitude: 78.9,
                },
            },
            token,
        });

        const result2 = await mockRequest({
            path: `/vendor/${result1.body.vendorId}`,
            action: 'get',
            token,
        });

        expect(result2.body).toEqual({
            name: 'test_vendor',
            type: VendorType.Restaraunt,
            vendorId: expect.any(String),
            createdDate: expect.any(String),
            updatedDate: expect.any(String),
        });
    });
});
