import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Position } from '../../generated/prisma/enums';

/** "GK,FW" gibi virgullu string'i ya da tekrarli query param'i Position[]'e cevirir. */
function toPositionArray(value: unknown): Position[] | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const raw =
    typeof value === 'string'
      ? value.split(',')
      : Array.isArray(value)
        ? value.filter((item): item is string => typeof item === 'string')
        : [];
  return raw.map((item) => item.trim().toUpperCase()) as Position[];
}

export class QueryPlayersDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @ApiPropertyOptional({ description: 'Isim veya takim icinde arama' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({
    enum: Position,
    isArray: true,
    description: 'Virgulle ayrilabilir',
  })
  @IsOptional()
  @Transform(({ value }) => toPositionArray(value))
  @IsArray()
  @IsEnum(Position, { each: true })
  positions?: Position[];

  @ApiPropertyOptional({ minimum: 14, maximum: 60 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(14)
  @Max(60)
  minAge?: number;

  @ApiPropertyOptional({ minimum: 14, maximum: 60 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(14)
  @Max(60)
  maxAge?: number;

  @ApiPropertyOptional({
    minimum: 0,
    maximum: 10,
    description: 'Minimum AI puani',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(10)
  minAiScore?: number;
}
