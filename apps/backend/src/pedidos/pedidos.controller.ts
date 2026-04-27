import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('pedidos')
@UseGuards(JwtAuthGuard)
export class PedidosController {
  constructor(private pedidosService: PedidosService) {}

  @Post()
  @Roles('CLIENTE')
  @UseGuards(RolesGuard)
  crear(@Request() req: any, @Body() dto: CreatePedidoDto) {
    return this.pedidosService.crear(req.user.id, dto);
  }

  @Get('mis-pedidos')
  @Roles('CLIENTE')
  @UseGuards(RolesGuard)
  misPedidos(@Request() req: any) {
    return this.pedidosService.findByCliente(req.user.id);
  }

  @Get('cocinera/:cocineraId')
  @Roles('COCINERA')
  @UseGuards(RolesGuard)
  pedidosCocinera(@Param('cocineraId', ParseIntPipe) cocineraId: number) {
    return this.pedidosService.findByCocinera(cocineraId);
  }

  @Put(':id/estado')
  actualizarEstado(@Param('id', ParseIntPipe) id: number, @Body('estado') estado: string) {
    return this.pedidosService.actualizarEstado(id, estado);
  }

  @Get('admin/reporte')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  reporteAdmin() {
    return this.pedidosService.reporteAdmin();
  }
}
