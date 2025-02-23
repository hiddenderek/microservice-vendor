import jwt from 'jwt-simple';
import dotenv from 'dotenv';
import tokenBody from '../fixtures/tokenBody.json';
import pgClientInfo from '../fixtures/pgClientInfo.json';
import { Client } from 'pg';
import { mockRequest } from './testHelpers';
import { ApiService } from '../../src/managers/apiManager/api.service';

dotenv.config();
const token = jwt.encode(tokenBody, 'test');

describe('test', () => {
    const mockedApiService: jest.SpyInstance<unknown, any, unknown> = jest.spyOn(
        ApiService.prototype,
        'getExternalData',
    );

    beforeEach(() => {
        mockedApiService.mockImplementation(async () => {
            return 'external' 
        });
    });

    const dbClient = new Client(pgClientInfo);

    beforeAll(async () => {
        jest.clearAllMocks();
        jest.resetAllMocks();
        await dbClient.connect();
        await dbClient.query(`
            TRUNCATE TABLE test_table;
        `);
    });

    afterEach(async () => {
        await dbClient.query(`
            TRUNCATE TABLE test_table;
        `);
        jest.clearAllMocks();
        jest.resetAllMocks();
        jest.useRealTimers();
    });

    afterAll(async () => {
        dbClient.end();
    });

    it('should post test data', async () => {
        const result = await mockRequest({
            path: `/tests`,
            action: 'post',
            body: {
                testValue: '12345',
                wowFactor: 'cool',
            },
        });
        expect(result.body).toEqual({
            testId: expect.any(String),
            testValue: '12345',
            wowFactor: 'cool',
        });
    });

    it('should post external test data', async () => {
        const result = await mockRequest({
            path: `/tests/external`,
            action: 'post',
            body: {
                testId: '92bcbaba-5134-49bf-8dbe-e21440c62317',
            },
        });
        expect(result.body).toEqual({
            testId: '92bcbaba-5134-49bf-8dbe-e21440c62317',
            testValue: 'external',
            wowFactor: null,
        });
    });

    it('should update test data', async () => {
        const result = await mockRequest({
            path: `/tests`,
            action: 'post',
            body: {
                testValue: '12345',
                wowFactor: 'cool',
            },
        });

        const result2 = await mockRequest({
            path: `/tests/update`,
            action: 'put',
            body: {
                testId: result.body.testId,
                wowFactor: 'coolio',
            },
        });
        
        expect(result2.body).toEqual({
            testId: result.body.testId,
            testValue: '12345',
            wowFactor: 'coolio',
        });
    });

    it('should post test data - upsert (update)', async () => {
        const result = await mockRequest({
            path: `/tests`,
            action: 'post',
            body: {
                testValue: '12345',
                wowFactor: 'cool',
            },
        });

        const result2 = await mockRequest({
            path: `/tests/upsert`,
            action: 'post',
            body: {
                testId: result.body.testId,
                testValue: '12345678',
                wowFactor: 'cool beans',
            },
        });

        expect(result2.body).toEqual({
            testId: result.body.testId,
            testValue: '12345678',
            wowFactor: 'cool beans',
        });
    });

    it('should post test data - upsert (create)', async () => {
        const result = await mockRequest({
            path: `/tests`,
            action: 'post',
            body: {
                testValue: '12345',
                wowFactor: 'cool',
            },
        });

        const result2 = await mockRequest({
            path: `/tests/upsert`,
            action: 'post',
            body: {
                testValue: '12345678',
                wowFactor: 'cool beans',
            },
        });

        const result3 = await mockRequest({
            path: '/tests',
            action: 'get',
            token,
        });

        // two separate records should be created

        expect(result3.body.length).toEqual(2);

        expect(result3.body[1]).toEqual({
            testId: result2.body.testId,
            testValue: '12345678',
            wowFactor: 'cool beans',
        });

        expect(result3.body[0]).toEqual({
            testId: result.body.testId,
            testValue: '12345',
            wowFactor: 'cool',
        });
    });

    it('should get test data', async () => {
        await mockRequest({
            path: `/tests`,
            action: 'post',
            body: {
                testValue: '12345',
                wowFactor: 'cool',
            },
        });
        await mockRequest({
            path: `/tests`,
            action: 'post',
            body: {
                testValue: '1234576',
                wowFactor: 'cool',
            },
        });
        const result = await mockRequest({
            path: `/tests?${new URLSearchParams({ testvalue: '12345', wowfactor: 'cool' }).toString()}`,
            action: 'get',
            token,
        });
        expect(result.body.length).toEqual(1);
        expect(result.body[0]).toEqual({
            testId: expect.any(String),
            testValue: '12345',
            wowFactor: 'cool',
        });
    });

    it('should delete test data', async () => {
        const result1 = await mockRequest({
            path: `/tests`,
            action: 'post',
            body: {
                testValue: '12345',
                wowFactor: 'cool',
            },
        });
        await mockRequest({
            path: `/tests?testid=${result1.body.testId}`,
            action: 'delete',
        });
        const result = await mockRequest({
            path: `/tests?${new URLSearchParams({ testvalue: '12345', wowfactor: 'cool' }).toString()}`,
            action: 'get',
            token,
        });
        expect(result.body.length).toEqual(0);
    });
});
