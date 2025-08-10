import request from 'supertest';
import { ApplicationModule } from '../../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Client } from 'pg';
import pgClientInfo from '../fixtures/pgClientInfo.json';
import dotenv from 'dotenv';

export const mockRequest = async (mockOptions: {
    path: string;
    action: 'get' | 'put' | 'post' | 'patch' | 'delete';
    // tenantId?: string;
    // clientId?: string;
    token?: string;
    body?: Record<string, any>;
}) => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [ApplicationModule],
    }).compile();

    let app = moduleFixture.createNestApplication();

    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    await app.init();

    const { path, action, token, body } = mockOptions;

    const req = request(app.getHttpServer())[action](path);

    if (token) req.set('Authorization', `Bearer ${token}`);

    let response;
    try {
        response = await req.send(body);
    } catch (e) {
        console.error(e);
        await app.close();
        return;
    }
    console.log(`Response status: ${response?.status}`);
    await app.close();
    return response;
};

export const setupTest = (tables?: string[]) => {
    dotenv.config();

    const dbClient = new Client(pgClientInfo);

    beforeAll(async () => {
        jest.clearAllMocks();
        jest.resetAllMocks();
        await dbClient.connect();
    });

    afterEach(async () => {
        jest.clearAllMocks();
        jest.resetAllMocks();
        jest.useRealTimers();
        if (tables) {
            await dbClient.query(`TRUNCATE TABLE` + tables.map((table) => ` ${table}`).join(','));
        }
    });

    afterAll(async () => {
        await dbClient.end();
    });
};
