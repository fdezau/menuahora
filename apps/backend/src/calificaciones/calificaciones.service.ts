import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCalificacionDto } from './dto/create-calificacion.dto';

@Injectable()
export class CalificacionesService {
  constructor(private prisma: PrismaService) {}

  async crear(clienteId: number, dto: CreateCalificacionDto) {
    const calificacion = await this.prisma.calificacion.create({
      data: { clienteId, cocineraId: dto.cocineraId, estrellas: dto.estrellas, comentario: dto.comentario },
    });

    const promedio = await this.prisma.calificacion.aggregate({
      where: { cocineraId: dto.cocineraId },
      _avg: { estrellas: true },
      _count: true,
    });

    await this.prisma.cocinera.update({
      where: { id: dto.cocineraId },
      data: {
        promedioEstrellas: promedio._avg.estrellas || 0,
        totalCalificaciones: promedio._count,
      },
    });

    return calificacion;
  }

  async findByCocinera(cocineraId: number) {
    return this.prisma.calificacion.findMany({
      where: { cocineraId },
      include: { cliente: { include: { usuario: { select: { nombre: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
