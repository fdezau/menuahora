import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { MenusService } from './menus.service';
import { CreateMenuSemanalDto } from './dto/create-menu.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('menus')
export class MenusController {
  constructor(private menusService: MenusService) {}

  @Post(':cocineraId')
  @UseGuards(JwtAuthGuard)
  crearMenuSemanal(
    @Param('cocineraId', ParseIntPipe) cocineraId: number,
    @Body() dto: CreateMenuSemanalDto,
  ) {
    return this.menusService.crearMenuSemanal(cocineraId, dto);
  }

  @Get(':cocineraId/semana')
  obtenerMenusSemana(
    @Param('cocineraId', ParseIntPipe) cocineraId: number,
    @Query('semanaInicio') semanaInicio: string,
  ) {
    return this.menusService.obtenerMenusSemana(cocineraId, semanaInicio);
  }

  @Get(':cocineraId/hoy')
  obtenerMenusHoy(@Param('cocineraId', ParseIntPipe) cocineraId: number) {
    return this.menusService.obtenerMenusHoy(cocineraId);
  }

  @Post('confirmar/:menuSemanalId')
  @UseGuards(JwtAuthGuard)
  confirmarMenuDia(@Param('menuSemanalId', ParseIntPipe) menuSemanalId: number) {
    return this.menusService.confirmarMenuDia(menuSemanalId);
  }
}
