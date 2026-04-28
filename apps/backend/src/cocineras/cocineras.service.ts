import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCocineraDto } from './dto/update-cocinera.dto';
import { CreateProductoDto } from './dto/create-producto.dto';

@Injectable()
export class CocinerasService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.cocinera.findMany({
      where: { activa: true },
      include: { usuario: { select: { nombre: true, telefono: true } } },
    });
  }

  async findById(id: number) {
    const cocinera = await this.prisma.cocinera.findUnique({
      where: { id },
      include: {
        usuario: { select: { nombre: true, telefono: true } },
        productosCarta: { where: { activo: true } },
      },
    });
    if (!cocinera) throw new NotFoundException('Cocinera no encontrada');
    return cocinera;
  }

  async findCercanas(lat: number, lng: number) {
    const cocineras = await this.prisma.cocinera.findMany({
      where: { activa: true, latitudCocina: { not: null } },
      include: { usuario: { select: { nombre: true } } },
    });

    return cocineras.filter((c) => {
      if (!c.latitudCocina || !c.longitudCocina) return false;
      const distancia = this.calcularDistancia(lat, lng, c.latitudCocina, c.longitudCocina);
      return distancia <= c.radioRepartoMetros;
    }).map((c) => ({
      ...c,
      distanciaMetros: Math.round(
        this.calcularDistancia(lat, lng, c.latitudCocina!, c.longitudCocina!),
      ),
    })).sort((a, b) => a.distanciaMetros - b.distanciaMetros);
  }

  async update(id: number, dto: UpdateCocineraDto) {
    return this.prisma.cocinera.update({ where: { id }, data: dto });
  }

  async agregarProducto(cocineraId: number, dto: CreateProductoDto) {
    return this.prisma.productoCarta.create({
      data: {
        cocineraId,
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        precio: dto.precio,
        tipo: dto.tipo,
        horarioInicio: dto.horarioInicio || '11:00',
        horarioFin: dto.horarioFin || '21:00',
      },
    });
  }

  async eliminarProducto(id: number) {
    return this.prisma.productoCarta.update({
      where: { id },
      data: { activo: false },
    });
  }

    private calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
