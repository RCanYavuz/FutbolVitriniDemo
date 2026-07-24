import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '../generated/prisma/enums';
import { AdminService } from './admin.service';
import {
  AdminStatsResponse,
  PendingUserResponse,
} from './dto/pending-user.response';

@ApiTags('admin')
@ApiBearerAuth()
@ApiCookieAuth()
@Controller('admin')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Panel ozet istatistikleri' })
  @ApiOkResponse({ type: AdminStatsResponse })
  stats() {
    return this.admin.getStats();
  }

  @Get('pending-users')
  @ApiOperation({ summary: 'Onay bekleyen kullanicilar' })
  @ApiOkResponse({ type: [PendingUserResponse] })
  pending() {
    return this.admin.listPending();
  }

  @Post('users/:id/approve')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Kullanici basvurusunu onaylar' })
  @ApiNoContentResponse()
  approve(@Param('id', ParseUUIDPipe) id: string) {
    return this.admin.approve(id);
  }

  @Post('users/:id/reject')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Kullanici basvurusunu reddeder' })
  @ApiNoContentResponse()
  reject(@Param('id', ParseUUIDPipe) id: string) {
    return this.admin.reject(id);
  }
}
