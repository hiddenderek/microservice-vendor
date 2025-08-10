import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsDefined,
    IsNumber,
    IsOptional,
    IsEnum,
    IsDateString,
    ValidateNested,
    IsArray,
    registerDecorator,
    ValidationOptions,
    type ValidationArguments,
    IsObject,
} from 'class-validator';
import { ConditionBlock, EffectType } from './types';
import { type FieldValue } from '../field-cache/types';
import { Type, Transform, plainToClass } from 'class-transformer';
import { ConditionType, OperatorType, ParenthesesType, LogicalOperatorType } from '../condition/types';


export class ConditionBlockDTO {
    @ApiProperty({ 
        description: 'Condition array', 
        type: 'array',
        items: {
            oneOf: [
                { $ref: '#/components/schemas/FieldConditionDTO' },
                { $ref: '#/components/schemas/OperatorConditionDTO' },
                { $ref: '#/components/schemas/ParenthesesConditionDTO' },
                { $ref: '#/components/schemas/LogicalOperatorConditionDTO' },
                { $ref: '#/components/schemas/ValueConditionDTO' }
            ]
        }
    })
    @IsDefined()
    @IsArray()
    @ValidateNested({ each: true })
    @Transform(({ value }) => transformConditionArray(value))
    readonly if!: ConditionTypeDTO[];

    @ApiProperty({ description: 'Effect ID to apply if condition matches' })
    @IsDefined()
    @IsString()
    readonly then!: string;
}

// Transform function for condition arrays
function transformConditionArray(value: any[]): any[] {
    if (!Array.isArray(value)) return value;
    
    return value.map(item => {
        const TargetClass = conditionTypeDiscriminator(item);
        if (TargetClass === Object) return item;
        return plainToClass(TargetClass, item);
    });
}

export class EffectCreateRequestDTO {
    @ApiProperty({ description: 'Effect type' })
    @IsDefined()
    @IsEnum(EffectType)
    readonly type!: EffectType;

    @ApiProperty({ description: 'Effect value' })
    @IsOptional()
    @IsNumber()
    readonly value!: number;

    @ApiProperty({ description: 'Effect details', required: false })
    @IsOptional()
    @IsObject()
    readonly details?: Record<string, any>;

    @ApiProperty({ 
        description: 'Effect conditions', 
        type: [ConditionBlockDTO], 
        required: false,
        isArray: true
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ConditionBlockDTO)
    @ConditionsAllowed()
    readonly conditions?: ConditionBlockDTO[];
}

export class EffectCreateResponseDTO {
    @ApiProperty({ description: 'Effect ID' })
    @IsDefined()
    @IsString()
    readonly effectId!: string;

    @ApiProperty({ description: 'Effect type' })
    @IsDefined()
    @IsEnum(EffectType)
    readonly type!: EffectType;

    @ApiProperty({ description: 'Effect value' })
    @IsOptional()
    readonly value?: FieldValue;

    @ApiProperty({ description: 'Effect details', required: false })
    @IsOptional()
    readonly details?: Record<string, any>;

    @ApiProperty({ description: 'Effect conditions', type: [Object], required: false })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    readonly conditions?: ConditionBlock[];

    @ApiProperty({ description: 'Created date' })
    @IsDefined()
    @IsDateString()
    readonly createdDate!: Date;

    @ApiProperty({ description: 'Updated date' })
    @IsDefined()
    @IsDateString()
    readonly updatedDate!: Date;
}

// Custom discriminator function for condition types
function conditionTypeDiscriminator(plain: any): any {
    if (plain.field !== undefined) {
        return FieldConditionDTO;
    }
    if (plain.operator !== undefined) {
        return OperatorConditionDTO;
    }
    if (plain.parentheses !== undefined) {
        return ParenthesesConditionDTO;
    }
    if (plain.logicalOperator !== undefined) {
        return LogicalOperatorConditionDTO;
    }
    if (plain.value !== undefined) {
        return ValueConditionDTO;
    }
    return Object; // fallback
}




function ConditionsAllowed(validationOptions?: ValidationOptions) {
    return function (object: EffectCreateRequestDTO, propertyName: string) {
        registerDecorator({
            name: 'conditionsAllowed',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(_, args: ValidationArguments) {
                    const dto = args.object as EffectCreateRequestDTO;

                    if (dto.type === EffectType.Condition && !dto?.conditions?.length) {
                        return false;
                    }

                    if (dto.type !== EffectType.Condition && dto?.conditions?.length) {
                        return false;
                    }

                    return true;
                },
                defaultMessage(args: ValidationArguments) {
                    const dto = args.object as EffectCreateRequestDTO;

                    if (dto.type === EffectType.Condition && !dto?.conditions?.length) {
                        return `conditions are required when type is 'condition'`;
                    }

                    return `conditions are only allowed when type is 'condition'`;
                },
            },
        });
    };
}

export class FieldConditionDTO {
    @ApiProperty({ description: 'Field name' })
    @IsDefined()
    @IsString()
    readonly field!: string;
}

export class OperatorConditionDTO {
    @ApiProperty({ description: 'Operator', enum: OperatorType })
    @IsDefined()
    @IsEnum(OperatorType)
    readonly operator!: OperatorType;
}

export class ParenthesesConditionDTO {
    @ApiProperty({ description: 'Parentheses', enum: ParenthesesType })
    @IsDefined()
    @IsEnum(ParenthesesType)
    readonly parentheses!: ParenthesesType;
}

export class LogicalOperatorConditionDTO {
    @ApiProperty({ description: 'Logical operator', enum: LogicalOperatorType })
    @IsDefined()
    @IsEnum(LogicalOperatorType)
    readonly logicalOperator!: LogicalOperatorType;
}

export class ValueConditionDTO {
    @ApiProperty({ description: 'Value' })
    @IsDefined()
    readonly value!: FieldValue;
}

export type ConditionTypeDTO =
    | FieldConditionDTO
    | OperatorConditionDTO
    | ParenthesesConditionDTO
    | LogicalOperatorConditionDTO
    | ValueConditionDTO;
