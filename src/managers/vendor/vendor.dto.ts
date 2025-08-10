import {
    IsString,
    IsNotEmpty,
    IsEnum,
    IsDefined,
    IsObject,
    ValidateNested,
    IsDateString,
    IsOptional,
    IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { VendorType } from './types';
import { LocationRequestDTO, LocationResponseDTO } from '../location/location.dto';

export class VendorRequestDTO {
    @ApiProperty({ description: 'vendor name' })
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    readonly name!: string;

    @ApiProperty({ description: 'vendor type' })
    @IsDefined()
    @IsEnum(VendorType)
    readonly type!: VendorType;

    @ApiProperty({ description: 'vendor location' })
    @IsObject()
    @IsOptional()
    readonly location?: LocationRequestDTO;

    @ApiProperty({ description: 'location combinations' })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LocationRequestDTO)
    readonly locationCombinations?: LocationRequestDTO[];
}

export class VendorResponseDTO {
    @ApiProperty({ description: 'vendor id' })
    @IsDefined()
    @IsString()
    readonly vendorId!: string;

    @ApiProperty({ description: 'vendor name' })
    @IsDefined()
    @IsString()
    readonly name!: string;

    @ApiProperty({ description: 'vendor type' })
    @IsDefined()
    @IsEnum(VendorType)
    readonly type!: VendorType;

    @ApiProperty({ description: 'vendor location' })
    @IsObject()
    readonly location?: LocationResponseDTO | null;

    @ApiProperty({ description: 'Vendor Created Date' })
    @IsDefined()
    @IsNotEmpty()
    @IsDateString()
    readonly createdDate!: Date;

    @ApiProperty({ description: 'Vendor Updated Date' })
    @IsDefined()
    @IsNotEmpty()
    @IsDateString()
    readonly updatedDate!: Date;
}
