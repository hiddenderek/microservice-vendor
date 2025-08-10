import { Module } from '@nestjs/common';

import { FieldCacheService } from './fieldCache.service';

@Module({
    providers: [FieldCacheService],
    exports: [FieldCacheService],
})
export class FieldCacheModule {}
