import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MenusService } from '../menus/menus.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';

const COMISION_PLATAFORMA = 2.5;
const COMISION_CULQI_PORCENTAJE = 0.0295;
const COMISION_CULQI_FIJA = 0.30;

@Injectable()
export class PedidosService {
  constructor(
    private prisma: PrismaService,
    private menusService: MenusService,
  ) {}

  async crear(clienteId: number, dto: CreatePedidoDto) {
    let subtotal = 0;
    const detallesData: any[] = [];

    for (const detalle of dto.detalles) {
      let precioUnitario = 0;

      if (detalle.menuSemanalId) {
        const menu = await this.prisma.menuSemanal.findUnique({
          where: { id: detalle.menuSemanalId },
        });
        if (!menu) throw new NotFoundException(`Menú ${detalle.menuSemanalId} no encontrado`);
        precioUnitario = menu.precio;
        await this.menusService.descontarCupo(detalle.menuSemanalId, detalle.cantidad);
      }

      if (detalle.productoCartaId) {
        const producto = await this.prisma.productoCarta.findUnique({
          where: { id: detalle.productoCartaId },
        });
        if (!producto) throw new NotFoundException(`Producto ${detalle.productoCartaId} no encontrado`);
        precioUnitario = producto.precio;
      }

      const subtotalDetalle = precioUnitario * detalle.cantidad;
      subtotal += subtotalDetalle;

      detallesData.push({
        menuSemanalId: detalle.menuSemanalId || null,
        productoCartaId: detalle.productoCartaId || null,
        cantidad: detalle.cantidad,
        precioUnitario,
        subtotal: subtotalDetalle,
      });
    }

    const comisionPlataforma = COMISION_PLATAFORMA * dto.detalles.reduce((acc, d) => acc + d.cantidad, 0);
    const comisionPasarela = (subtotal * COMISION_CULQI_PORCENTAJE) + COMISION_CULQI_FIJA;
    const totalPagado = subtotal;
    const gananciaCocinera = subtotal - comisionPlataforma - comisionPasarela;

    // TODO: Integrar Culqi real aquí
    const culqiChargeId = `test_${Date.now()}`;

    const pedido = await this.prisma.pedido.create({
      data: {
        clienteId,
        cocineraId: dto.cocineraId,
        horaEntregaElegida: dto.horaEntregaElegida,
        direccionEntrega: dto.direccionEntrega,
        latitudEntrega: dto.latitudEntrega,
        longitudEntrega: dto.longitudEntrega,
        subtotal,
        comisionPlataforma,
        comisionPasarela,
        totalPagado,
        gananciaCocinera,
        culqiChargeId,
        detalles: { create: detallesData },
        pago: {
          create: {
            culqiChargeId,
            monto: totalPagado,
            metodoPago: 'TARJETA',
          },
        },
      },
      include: { detalles: true, pago: true },
    });

    return pedido;
  }

  async findByCliente(clienteId: number) {
    return this.prisma.pedido.findMany({
      where: { clienteId },
      include: { detalles: true, cocinera: { include: { usuario: { select: { nombre: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByCocinera(cocineraId: number) {
    const hoy = new Date(new Date().toDateString());
    return this.prisma.pedido.findMany({
      where: { cocineraId, createdAt: { gte: hoy } },
      include: { detalles: true, cliente: { include: { usuario: { select: { nombre: true, telefono: true } } } } },
      orderBy: { horaEntregaElegida: 'asc' },
    });
  }

  async actualizarEstado(id: number, estado: any) {
    return this.prisma.pedido.update({ where: { id }, data: { estado } });
  }

  async reporteAdmin() {
    const hoy = new Date(new Date().toDateString());
    const pedidos = await this.prisma.pedido.findMany({
      where: { createdAt: { gte: hoy } },
    });

    return {
      totalPedidos: pedidos.length,
      ingresosBrutos: pedidos.reduce((acc, p) => acc + p.totalPagado, 0),
      comisionTotal: pedidos.reduce((acc, p) => acc + p.comisionPlataforma, 0),
      comisionPasarela: pedidos.reduce((acc, p) => acc + p.comisionPasarela, 0),
    };
  }
}
