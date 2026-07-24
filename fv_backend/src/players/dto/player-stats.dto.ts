import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

/** 0-100 arasi tek bir istatistik alani. */
function Stat() {
  return function (target: object, propertyKey: string) {
    ApiProperty({ minimum: 0, maximum: 100, example: 80 })(target, propertyKey);
    Type(() => Number)(target, propertyKey);
    IsInt()(target, propertyKey);
    Min(0)(target, propertyKey);
    Max(100)(target, propertyKey);
  };
}

export class PlayerStatsDto {
  @Stat() pace!: number;
  @Stat() passing!: number;
  @Stat() defending!: number;
  @Stat() physical!: number;
  @Stat() tackling!: number;
  @Stat() vision!: number;
  @Stat() dribbling!: number;
  @Stat() shooting!: number;
}

export class PlayerMetricsDto {
  @Stat() sprintSpeed!: number;
  @Stat() shotPower!: number;
  @Stat() passingAcc!: number;
}
