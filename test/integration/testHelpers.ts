import request from 'supertest';
import { ApplicationModule } from '../../src/app.module';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

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
    await app.init();
    const { path, action, token, body } = mockOptions;
    const req = request(app.getHttpServer())[action](path);
    if (token) req.set('Authorization', `Bearer ${token}`);
    // if (tenantId) req.set('tenantId', tenantId);
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
