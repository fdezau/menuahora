import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseIntPipe, ParseFloatPipe } from '@nestjs/common';
import { CocinerasService } from './cocineras.service';
import { UpdateCocineraDto } from './dto/update-cocinera.dto';
import { CreateProductoDto } from './dto/create-producto.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cocineras')
export class CocinerasController {
  constructor(private cocinerasService: CocinerasService) {}

  @Get()
  findAll() {
    return this.cocinerasService.findAll();
  }

  @Get('cercanas')
  findCercanas(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lng', ParseFloatPipe) lng: number,
  ) {
    return this.cocinerasService.findCercanas(lat, lng);
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.cocinerasService.findById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCocineraDto) {
    return this.cocinerasService.update(id, dto);
  }

  @Post(':id/productos')
  @UseGuards(JwtAuthGuard)
  agregarProducto(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateProductoDto) {
    return this.cocinerasService.agregarProducto(id, dto);
  }

  @Delete('productos/:productoId')
  @UseGuards(JwtAuthGuard)
  eliminarProducto(@Param('productoId', ParseIntPipe) productoId: number) {
    return this.cocinerasService.eliminarProducto(productoId);
  }
}
