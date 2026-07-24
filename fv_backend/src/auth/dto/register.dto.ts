import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Position } from '../../generated/prisma/enums';

/** Kayit ekraninda yalnizca oyuncu ve kulup (scout/antrenor) secilebilir. */
export type RegisterRole = 'player' | 'club';
export type RegisterClubSubRole = 'scout' | 'coach';
export type RegisterPreferredFoot = 'left' | 'right' | 'both';

export class RegisterDto {
  @ApiProperty({
    example: 'arda',
    description: 'Benzersiz kullanici adi (giriste kullanilir)',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Kullanici adi yalnizca harf, rakam ve alt cizgi icerebilir',
  })
  username!: string;

  @ApiProperty({ example: 'arda@futbolvitrini.com' })
  @IsEmail({}, { message: 'Gecerli bir e-posta adresi giriniz' })
  email!: string;

  @ApiProperty({ example: 'Arda Guler', minLength: 2, maxLength: 80 })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  displayName!: string;

  @ApiProperty({ example: 'CokGizliParola123', minLength: 8, maxLength: 72 })
  @IsString()
  @MinLength(8, { message: 'Parola en az 8 karakter olmalidir' })
  @MaxLength(72)
  password!: string;

  @ApiProperty({ enum: ['player', 'club'], example: 'player' })
  @IsIn(['player', 'club'])
  role!: RegisterRole;

  @ApiPropertyOptional({
    enum: ['scout', 'coach'],
    example: 'coach',
    description: 'Kulup rolundeki hesap turu; gonderilmezse scout kabul edilir',
  })
  @IsOptional()
  @IsIn(['scout', 'coach'])
  subRole?: RegisterClubSubRole;

  @ApiPropertyOptional({
    example: 'https://example.com/arda.png',
    description: 'Opsiyonel profil fotografi adresi',
  })
  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(2048)
  avatarUrl?: string;

  @ApiPropertyOptional({
    enum: Position,
    example: Position.FW,
    description: 'Oyuncu rolunde zorunlu mevki',
  })
  @ValidateIf((dto: RegisterDto) => dto.role === 'player')
  @IsEnum(Position)
  position?: Position;

  @ApiPropertyOptional({
    enum: ['left', 'right', 'both'],
    example: 'left',
    description: 'Oyuncu rolunde zorunlu tercih edilen ayak',
  })
  @ValidateIf((dto: RegisterDto) => dto.role === 'player')
  @IsIn(['left', 'right', 'both'])
  preferredFoot?: RegisterPreferredFoot;

  @ApiPropertyOptional({
    example: '2005-02-25',
    format: 'date',
    description: 'Oyuncu rolunde zorunlu dogum tarihi',
  })
  @ValidateIf((dto: RegisterDto) => dto.role === 'player')
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Dogum tarihi YYYY-MM-DD biciminde olmalidir',
  })
  @IsDateString({ strict: true })
  birthDate?: string;

  @ApiPropertyOptional({
    example: 'Fenerbahce U19',
    description: 'Oyuncunun guncel kulubu',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  currentClub?: string;

  @ApiPropertyOptional({
    example: 'Bursaspor',
    description: 'Kulup rolunde calisilan kurum',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  organization?: string;

  @ApiPropertyOptional({
    example: 'A Takim Scout',
    description: 'Kulup rolunde uzmanlik alani',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  expertise?: string;
}
