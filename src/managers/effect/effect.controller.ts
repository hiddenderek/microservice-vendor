import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import type { EffectCreateRequestDTO, EffectCreateResponseDTO } from './effect.dto';
import { EffectService } from './effect.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('effect')
@ApiTags('effect')
export class EffectController {
    constructor(private readonly effectService: EffectService) {}

    @Post()
    async createEffect(@Body() body: EffectCreateRequestDTO): Promise<EffectCreateResponseDTO> {
        return await this.effectService.createEffect(body);
    }

    @Post('/condition')
    async createConditionalEffect(
        @Body() body: EffectCreateRequestDTO,
    ): Promise<EffectCreateResponseDTO> {
        return await this.effectService.createConditionalEffect(body);
    }

    @Get(':effectId')
    async getEffect(@Param('effectId') effectId: string): Promise<EffectCreateResponseDTO | null> {
        return await this.effectService.getEffect(effectId);
    }
}
