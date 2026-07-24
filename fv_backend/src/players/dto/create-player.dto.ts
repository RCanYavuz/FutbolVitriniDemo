import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Position } from '../../generated/prisma/enums';
import { PlayerMetricsDto, PlayerStatsDto } from './player-stats.dto';

export class CreatePlayerDto {
  @ApiProperty({ example: 'Lucas Silva' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 21, minimum: 14, maximum: 60 })
  @Type(() => Number)
  @IsInt()
  @Min(14)
  @Max(60)
  age!: number;

  @ApiProperty({ enum: Position, enumName: 'Position' })
  @IsEnum(Position)
  position!: Position;

  @ApiProperty({ example: 'FC Porto B' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  team!: string;

  @ApiProperty({ example: 8.9, minimum: 0, maximum: 10 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(10)
  aiScore!: number;

  @ApiPropertyOptional({ example: 94, minimum: 0, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  matchPercentage?: number;

  @ApiPropertyOptional({
    example: 'High-pressing striker with top-decile acceleration.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  aiReasoning?: string;

  @ApiPropertyOptional({ example: 'https://...' })
  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(1000)
  imageUrl?: string;

  @ApiProperty({ type: PlayerStatsDto })
  @ValidateNested()
  @Type(() => PlayerStatsDto)
  stats!: PlayerStatsDto;

  @ApiProperty({ type: PlayerMetricsDto })
  @ValidateNested()
  @Type(() => PlayerMetricsDto)
  metrics!: PlayerMetricsDto;
}
