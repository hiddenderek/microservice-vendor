import { Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { cache } from './utils/cache';

export class FieldCacheService {
    private readonly vendorId;

    constructor(
        @Inject(REQUEST) private readonly request: any,
    ) {
        this.vendorId = this.request.user.vendorId;
    }

    testInfo = cache(async () => await this._getTestInfo());

    private async _getTestInfo() {
       // Simulate fetching test info from a database or external service
       return {
        test: 10,
        test1: 1,
       }
    }
    
    test = async () => (await this.testInfo())?.test
    test1 = async () => (await this.testInfo())?.test1
}