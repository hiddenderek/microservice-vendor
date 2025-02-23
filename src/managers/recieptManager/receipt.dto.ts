import { IsString, IsInt, MinLength, IsOptional, IsNotEmpty, IsNumberString, ArrayNotEmpty, ValidateNested, IsUUID, IsEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';
import { Type } from 'class-transformer';

export class Item {
    @IsUUID()
    @IsNotEmpty()
    itemId: string;

    @IsNotEmpty()
    @IsString()
    shortDescription: string;
  
    @IsNotEmpty()
    @IsNumberString()
    price: string;

    @IsUUID()
    @IsNotEmpty()
    receiptId: string;

    constructor(data: Item) {
        this.itemId = data?.itemId;
        this.shortDescription = data?.receiptId ?? uuidv4();
        this.price = data?.price;
        this.receiptId = data?.receiptId;
    }
  }

export class Receipt {
    @IsUUID()
    @IsEmpty()
    receiptId: string;

    @ApiProperty({ description: 'coolest prop ever' })
    @IsNotEmpty()
    @IsString()
    retailer: string;
  
    @ApiProperty({ description: 'coolest prop ever' })
    @IsNotEmpty()
    @IsString()
    purchaseDate: string;
  
    @ApiProperty({ description: 'coolest prop ever' })
    @IsNotEmpty()
    @IsString()
    purchaseTime: string;
  
    @ApiProperty({ description: 'coolest prop ever' })
    @IsNotEmpty()
    @IsNumberString()
    total: string;
  
    @ApiProperty({ description: 'coolest prop ever' })
    @IsNotEmpty()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => Item)
    items: Item[];

    constructor(data: Receipt) {
        this.receiptId = data?.receiptId ?? uuidv4();
        this.retailer = data?.retailer;
        this.purchaseDate = data?.purchaseDate;
        this.purchaseTime = data?.purchaseTime;
        this.total = data?.total;
        this.items = data?.items;
    }
}
