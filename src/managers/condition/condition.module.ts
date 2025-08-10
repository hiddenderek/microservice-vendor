import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { ConditionService } from './condition.service';
import { FieldCacheModule } from '../field-cache/fieldCache.module';

@Module({
    imports: [FieldCacheModule],
    providers: [ConditionService],
    exports: [ConditionService],
})
export class ConditionModule {}
