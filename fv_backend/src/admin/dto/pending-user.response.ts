import { ApiProperty } from '@nestjs/swagger';

/**
 * Admin panelindeki onay tablosunun bekledigi sekil
 * (fv_frontend/src/pages/admin/AdminDashboard.tsx).
 */
export class PendingUserResponse {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Ahmet Yilmaz' })
  name!: string;

  @ApiProperty({ example: 'ahmet@scout.com' })
  email!: string;

  @ApiProperty({
    example: 'Scout',
    description: 'Rolun Turkce gorunen etiketi',
  })
  role!: string;

  @ApiProperty({
    example: '2026-07-23',
    description: 'Basvuru tarihi (YYYY-MM-DD)',
  })
  date!: string;

  @ApiProperty({ example: 'Bekliyor' })
  status!: string;
}

export class AdminStatsResponse {
  @ApiProperty({ example: 3 })
  totalStaff!: number;

  @ApiProperty({ example: 8 })
  activePlayers!: number;

  @ApiProperty({ example: 2 })
  pendingApprovals!: number;
}
