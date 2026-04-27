import { Controller, Get, Post, Body, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { CalificacionesService } from './calificaciones.service';
import { CreateCalificacionDto } from './dto/create-calificacion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('calificaciones')
@UseGuards(JwtAuthGuard)
export class CalificacionesController {
  constructor(private calificacionesService: CalificacionesService) {}

  @Post()
  crear(@Request() req: any, @Body() dto: CreateCalificacionDto) {
    return this.calificacionesService.crear(req.user.id, dto);
  }

  @Get('cocinera/:cocineraId')
  findByCocinera(@Param('cocineraId', ParseIntPipe) cocineraId: number) {
    return this.calificacionesService.findByCocinera(cocineraId);
  }
}
