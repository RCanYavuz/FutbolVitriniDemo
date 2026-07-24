import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Position } from '../../generated/prisma/enums';

/** frontend PlayerStats (0-100 olcek) */
export class PlayerStatsResponse {
  @ApiProperty() pace!: number;
  @ApiProperty() passing!: number;
  @ApiProperty() defending!: number;
  @ApiProperty() physical!: number;
  @ApiProperty() tackling!: number;
  @ApiProperty() vision!: number;
  @ApiProperty() dribbling!: number;
  @ApiProperty() shooting!: number;
}

/** frontend PlayerMetrics */
export class PlayerMetricsResponse {
  @ApiProperty() sprintSpeed!: number;
  @ApiProperty() shotPower!: number;
  @ApiProperty() passingAcc!: number;
}

/**
 * fv_frontend'in `Player` tipiyle (src/store/types.ts) birebir ayni sekil.
 * DB'de duz tutulan istatistikler burada nested nesnelere gruplanir.
 */
export class PlayerResponse {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Lucas Silva' })
  name!: string;

  @ApiProperty({ example: 21 })
  age!: number;

  @ApiProperty({ enum: Position, enumName: 'Position' })
  position!: Position;

  @ApiProperty({ example: 'FC Porto B' })
  team!: string;

  @ApiProperty({ example: 8.9 })
  aiScore!: number;

  @ApiPropertyOptional({ example: 94, nullable: true })
  matchPercentage?: number;

  @ApiProperty({ type: PlayerStatsResponse })
  stats!: PlayerStatsResponse;

  @ApiProperty({ type: PlayerMetricsResponse })
  metrics!: PlayerMetricsResponse;

  @ApiProperty()
  imageUrl!: string;

  @ApiPropertyOptional({ nullable: true })
  aiReasoning?: string;
}

export class PaginatedPlayersResponse {
  @ApiProperty({ type: [PlayerResponse] })
  items!: PlayerResponse[];

  @ApiProperty({ example: 12 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 1 })
  pageCount!: number;
}
