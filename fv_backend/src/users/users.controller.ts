import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserResponse } from './dto/user.response';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@ApiCookieAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Oturum acmis kullanicinin profili' })
  @ApiOkResponse({ type: UserResponse })
  me(@CurrentUser('id') userId: string) {
    return this.users.getProfile(userId);
  }
}
