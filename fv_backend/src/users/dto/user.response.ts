import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type UserRoleResponse = 'admin' | 'club' | 'player';
export type UserSubRoleResponse = 'admin' | 'scout' | 'coach' | 'player';

/**
 * fv_frontend'in `User` tipiyle (src/store/types.ts) birebir ayni sekil.
 * Frontend gezinmeyi `role`/`subRole`'e gore yaptigi icin bu alanlar sarttir.
 */
export class UserResponse {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Ahmet Yilmaz' })
  name!: string;

  @ApiProperty({ enum: ['admin', 'club', 'player'], enumName: 'UserRole' })
  role!: UserRoleResponse;

  @ApiProperty({
    enum: ['admin', 'scout', 'coach', 'player'],
    enumName: 'UserSubRole',
  })
  subRole!: UserSubRoleResponse;

  @ApiProperty({ example: 'https://ui-avatars.com/api/?name=Ahmet' })
  avatarUrl!: string;

  @ApiPropertyOptional({ enum: ['GK', 'DF', 'MF', 'FW'], nullable: true })
  position!: 'GK' | 'DF' | 'MF' | 'FW' | null;

  @ApiPropertyOptional({
    enum: ['left', 'right', 'both'],
    nullable: true,
  })
  preferredFoot!: 'left' | 'right' | 'both' | null;

  @ApiPropertyOptional({
    example: '2005-02-25',
    format: 'date',
    nullable: true,
  })
  birthDate!: string | null;

  @ApiPropertyOptional({ example: 'Fenerbahce U19', nullable: true })
  currentClub!: string | null;

  @ApiPropertyOptional({ example: 'Bursaspor', nullable: true })
  organization!: string | null;

  @ApiPropertyOptional({ example: 'Teknik Direktor', nullable: true })
  expertise!: string | null;
}
