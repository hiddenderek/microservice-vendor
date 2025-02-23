import jwt from 'jwt-simple';
import dotenv from 'dotenv';
import tokenBody from '../fixtures/tokenBody.json';
import pgClientInfo from '../fixtures/pgClientInfo.json';
import { Client } from 'pg';
import { mockRequest } from './testHelpers';
import { ApiService } from '../../src/managers/apiManager/api.service';

dotenv.config();
const token = jwt.encode(tokenBody, 'test');

describe('application', () => {

    const dbClient = new Client(pgClientInfo);

    beforeAll(async () => {
        jest.clearAllMocks();
        jest.resetAllMocks();
        await dbClient.connect();
        await dbClient.query(`
            TRUNCATE TABLE application;
        `);
    });

    afterEach(async () => {
        await dbClient.query(`
            TRUNCATE TABLE application;
        `);
        jest.clearAllMocks();
        jest.resetAllMocks();
        jest.useRealTimers();
    });

    afterAll(async () => {
        dbClient.end();
    });

    it('should post application data', async () => {
        const result = await mockRequest({
            path: `/application/user`,
            action: 'post',
            body: {
                name: 'john',
                address: 'test',
                email: 'test',
                phone: 'test',
                ssn: 'test',
                totalLoanAmount: 3000,
            },
        });
        expect(result.body.status).toEqual('denied');
    });

    it('should post application data - 24 month term', async () => {
        const mockedApiService: jest.SpyInstance<unknown, any, unknown> = jest.spyOn(
            ApiService.prototype,
            'getExternalData',
        );
        mockedApiService.mockImplementationOnce(async () => {
            return 30;
        });
        const result = await mockRequest({
            path: `/application/user`,
            action: 'post',
            body: {
                name: 'john',
                address: 'test',
                email: 'test',
                phone: 'test',
                ssn: 'test',
                totalLoanAmount: 100,
            },
        });
        expect(result.body.monthTerm).toEqual(24);
        expect(result.body.interest).toEqual(.20);
        expect(result.body.monthlyPayment).toEqual(6);
    });
});
