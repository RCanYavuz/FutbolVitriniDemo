import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'scout', description: 'Kullanici adi' })
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  username!: string;

  @ApiProperty({ example: 'scout123' })
  @IsString()
  @MinLength(6)
  @MaxLength(72)
  password!: string;
}
