import { ApiProperty } from '@nestjs/swagger';
import { UserResponse } from '../../users/dto/user.response';

export class AuthResponse {
  @ApiProperty({ type: UserResponse })
  user!: UserResponse;

  @ApiProperty({
    description:
      'Access token. Tarayici istemcileri icin ayrica HttpOnly cookie olarak da set edilir; ' +
      'cookie kullanan istemcilerin bu alani saklamasina gerek yoktur.',
  })
  accessToken!: string;
}

/** Kayit sonrasi hesap admin onayi bekledigi icin token verilmez. */
export class RegisterResponse {
  @ApiProperty({ example: 'pending' })
  status!: 'pending';

  @ApiProperty({
    example:
      'Kaydiniz alindi. Hesabiniz yonetici onayindan sonra aktiflesecek.',
  })
  message!: string;
}
