import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsEnum,
    IsDefined,
    IsNumber,
    IsObject,
    ValidateNested,
    IsDateString,
    IsOptional,
    IsArray,
} from 'class-validator';
import { LocationType } from './types';
import { Type } from 'class-transformer';

export class LocationRequestDTO {
    @ApiProperty({ description: 'location id', required: false })
    @IsOptional()
    @IsString()
    readonly locationId?: string;

    @ApiProperty({ description: 'location latitude', required: false })
    @IsOptional()
    @IsNumber()
    readonly latitude?: number;

    @ApiProperty({ description: 'location longitude', required: false })
    @IsOptional()
    @IsNumber()
    readonly longitude?: number;
}

export class LocationCreateRequestDTO {
    @ApiProperty({ description: 'location latitude', required: false })
    @IsOptional()
    @IsNumber()
    readonly latitude?: number;

    @ApiProperty({ description: 'location longitude', required: false })
    @IsOptional()
    @IsNumber()
    readonly longitude?: number;
}

export class LocationCombinationCreateRequestDTO {
    @ApiProperty({ description: 'combination id (optional, for updating existing combination)' })
    @IsOptional()
    @IsString()
    readonly combinationId?: string;

    @ApiProperty({ description: 'location combinations' })
    @IsDefined()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LocationRequestDTO)
    readonly locationCombinations!: LocationRequestDTO[];
}

export class LocationResponseDTO {
    @ApiProperty({ description: 'vendor id' })
    @IsDefined()
    @IsString()
    readonly locationId!: string;

    @ApiProperty({ description: 'vendor id' })
    @IsOptional()
    @IsString()
    readonly combinationId?: string;

    @ApiProperty({ description: 'vendor id' })
    @IsDefined()
    @IsString()
    readonly vendorId!: string;

    @ApiProperty({ description: 'location latitude' })
    @IsOptional()
    @IsNumber()
    readonly latitude?: number;

    @ApiProperty({ description: 'location longitude' })
    @IsOptional()
    @IsNumber()
    readonly longitude?: number;

    @ApiProperty({ description: 'location type' })
    @IsDefined()
    @IsEnum(LocationType)
    readonly type!: LocationType;

    @ApiProperty({ description: 'location Created Date' })
    @IsDefined()
    @IsNotEmpty()
    @IsDateString()
    readonly createdDate!: Date;

    @ApiProperty({ description: 'location Updated Date' })
    @IsDefined()
    @IsNotEmpty()
    @IsDateString()
    readonly updatedDate!: Date;
}

export class LocationCombinationResponseDTO {
    @ApiProperty({ description: 'location combination' })
    @IsDefined()
    @IsObject()
    readonly locationCombination!: LocationResponseDTO;

    @ApiProperty({ description: 'location items' })
    @IsDefined()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LocationResponseDTO)
    readonly items!: LocationResponseDTO[];
}
