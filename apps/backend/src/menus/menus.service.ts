import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuSemanalDto } from './dto/create-menu.dto';

@Injectable()
export class MenusService {
  constructor(private prisma: PrismaService) {}

  async crearMenuSemanal(cocineraId: number, dto: CreateMenuSemanalDto) {
    const semanaInicio = new Date(dto.semanaInicio);

    const menus = await Promise.all(
      dto.menus.map((menu) =>
        this.prisma.menuSemanal.create({
          data: {
            cocineraId,
            semanaInicio,
            dia: menu.dia,
            descripcion: menu.descripcion,
            entrada1: menu.entrada1,
            entrada2: menu.entrada2,
            incluyeRefresco: menu.incluyeRefresco ?? true,
            precio: menu.precio,
            cuposTotales: menu.cuposTotales ?? 24,
          },
        }),
      ),
    );

    return menus;
  }

  async obtenerMenusSemana(cocineraId: number, semanaInicio: string) {
    return this.prisma.menuSemanal.findMany({
      where: {
        cocineraId,
        semanaInicio: new Date(semanaInicio),
        activo: true,
      },
      orderBy: { dia: 'asc' },
    });
  }

  async obtenerMenusHoy(cocineraId: number) {
    const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    const hoy = dias[new Date().getDay()] as any;

    return this.prisma.menuSemanal.findMany({
      where: { cocineraId, dia: hoy, activo: true },
      include: {
        confirmaciones: {
          where: { fecha: { gte: new Date(new Date().toDateString()) } },
        },
      },
    });
  }

  async confirmarMenuDia(menuSemanalId: number) {
    const hoy = new Date(new Date().toDateString());

    return this.prisma.confirmacionDiaria.upsert({
      where: { menuSemanalId_fecha: { menuSemanalId, fecha: hoy } },
      update: { confirmado: true },
      create: { menuSemanalId, fecha: hoy, confirmado: true },
    });
  }

  async descontarCupo(menuSemanalId: number, cantidad: number) {
    const hoy = new Date(new Date().toDateString());

    const confirmacion = await this.prisma.confirmacionDiaria.findUnique({
      where: { menuSemanalId_fecha: { menuSemanalId, fecha: hoy } },
    });

    if (!confirmacion || confirmacion.cuposDisponibles < cantidad) {
      throw new NotFoundException('No hay cupos disponibles');
    }

    return this.prisma.confirmacionDiaria.update({
      where: { id: confirmacion.id },
      data: { cuposDisponibles: { decrement: cantidad } },
    });
  }
}
