import {
    IsString,
    IsNotEmpty,
    IsEnum,
    IsDefined,
    ValidateNested,
    IsOptional,
    IsArray,
    IsUUID,
    IsDateString,
    IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PriceUnit, CatalogType } from './types';

export class CreateCatalogRequestDTO {
    @ApiProperty({ description: 'Catalog name' })
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    readonly name!: string;

    @ApiProperty({ description: 'Catalog type' })
    @IsDefined()
    @IsEnum(CatalogType)
    readonly type!: CatalogType;

    @ApiProperty({ description: 'Catalog location' })
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    readonly locationId!: string;

    @ApiProperty({ description: 'Catalog items' })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateCatalogItemRequestDTO)
    items!: CreateCatalogItemRequestDTO[];
}

export class CreateCatalogItemRequestDTO {
    @ApiProperty({ description: 'Type of the catalog item', example: 'accessory' })
    @IsString()
    @IsDefined()
    @IsNotEmpty()
    type!: string;

    @ApiProperty({ description: 'Name of the catalog item', example: 'Gunpla frame extender' })
    @IsString()
    @IsDefined()
    @IsNotEmpty()
    name!: string;

    @ApiProperty({ description: 'Price of the catalog item', example: 19.99 })
    @IsNumber()
    @IsDefined()
    price!: number;

    @ApiProperty({ description: 'Details object', required: false })
    @IsOptional()
    details?: Record<string, any>;
}

export class CatalogItemResponseDTO {
    @ApiProperty({ description: 'Catalog item Id' })
    @IsDefined()
    @IsNotEmpty()
    @IsUUID()
    readonly catalogItemId!: string;

    @ApiProperty({ description: 'Vendor Id' })
    @IsDefined()
    @IsNotEmpty()
    @IsUUID()
    readonly vendorId!: string;

    @ApiProperty({ description: 'Vendor Type' })
    @IsString()
    @IsDefined()
    @IsNotEmpty()
    readonly type!: string;

    @ApiProperty({ description: 'Vendor Name' })
    @IsString()
    @IsDefined()
    @IsNotEmpty()
    readonly name!: string;

    @ApiProperty({ description: 'Vendor Price' })
    @IsNumber()
    @IsDefined()
    @IsNotEmpty()
    readonly price!: number;

    @ApiProperty({ description: 'Vendor Price Unit' })
    @IsString()
    @IsDefined()
    @IsEnum(PriceUnit)
    readonly priceUnit?: PriceUnit;

    @ApiProperty({ description: 'Details object', required: false })
    @IsOptional()
    readonly details?: Record<string, any>;

    @ApiProperty({ description: 'Catalog Created Date' })
    @IsDefined()
    @IsNotEmpty()
    @IsDateString()
    readonly createdDate!: Date;

    @ApiProperty({ description: 'Catalog Updated Date' })
    @IsDefined()
    @IsNotEmpty()
    @IsDateString()
    readonly updatedDate!: Date;
}

export class CatalogResponseDTO {
    @ApiProperty({ description: 'Catalog Id' })
    @IsDefined()
    @IsNotEmpty()
    @IsUUID()
    readonly catalogId!: string;

    @ApiProperty({ description: 'Vendor Id' })
    @IsDefined()
    @IsNotEmpty()
    @IsUUID()
    readonly vendorId!: string;

    @ApiProperty({ description: 'Catalog name' })
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    readonly name!: string;

    @ApiProperty({ description: 'Catalog type' })
    @IsDefined()
    @IsEnum(CatalogType)
    readonly type!: CatalogType;

    @ApiProperty({ description: 'Catalog location' })
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    readonly locationId!: string;

    @ApiProperty({ description: 'Catalog items' })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CatalogItemResponseDTO)
    readonly items!: CatalogItemResponseDTO[];

    @ApiProperty({ description: 'Catalog Created Date' })
    @IsDefined()
    @IsNotEmpty()
    @IsDateString()
    readonly createdDate!: Date;

    @ApiProperty({ description: 'Catalog Updated Date' })
    @IsDefined()
    @IsNotEmpty()
    @IsDateString()
    readonly updatedDate!: Date;
}
