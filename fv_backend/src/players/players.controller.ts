import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  CurrentUser,
  type AuthUser,
} from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CreatePlayerDto } from './dto/create-player.dto';
import {
  PaginatedPlayersResponse,
  PlayerResponse,
} from './dto/player.response';
import { QueryPlayersDto } from './dto/query-players.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { PlayersService } from './players.service';

@ApiTags('players')
@Controller('players')
export class PlayersController {
  constructor(private readonly players: PlayersService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Oyuncu profillerini listeler (filtreli, sayfali)' })
  @ApiOkResponse({ type: PaginatedPlayersResponse })
  findAll(@Query() query: QueryPlayersDto) {
    return this.players.findAll(query);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Kendi olusturdugum oyuncu profilleri' })
  @ApiOkResponse({ type: PaginatedPlayersResponse })
  findMine(@Query() query: QueryPlayersDto, @CurrentUser('id') userId: string) {
    return this.players.findAll(query, userId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Tek bir oyuncu profili' })
  @ApiOkResponse({ type: PlayerResponse })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.players.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Yeni oyuncu profili olusturur' })
  @ApiCreatedResponse({ type: PlayerResponse })
  create(@Body() dto: CreatePlayerDto, @CurrentUser('id') userId: string) {
    return this.players.create(dto, userId);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Oyuncu profilini gunceller (sahibi veya admin)' })
  @ApiOkResponse({ type: PlayerResponse })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePlayerDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.players.update(id, dto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Oyuncu profilini siler (sahibi veya admin)' })
  @ApiNoContentResponse()
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.players.remove(id, user);
  }
}
