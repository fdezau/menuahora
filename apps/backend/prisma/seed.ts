import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('123456', 10);

  // Admin (Tú)
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@menuahora.com' },
    update: {},
    create: {
      nombre: 'Francisco Deza',
      email: 'admin@menuahora.com',
      password,
      rol: 'ADMIN',
      telefono: '999999999',
    },
  });

  // Cocinera 1
  const usuarioCocinera1 = await prisma.usuario.upsert({
    where: { email: 'maria@menuahora.com' },
    update: {},
    create: {
      nombre: 'María López',
      email: 'maria@menuahora.com',
      password,
      rol: 'COCINERA',
      telefono: '987654321',
      cocinera: {
        create: {
          nombreNegocio: 'Sazón de María',
          descripcion: 'Comida casera con sabor de hogar',
          latitudCocina: -12.0464,
          longitudCocina: -77.0428,
          direccionReferencia: 'Av. Arequipa 1200, Lince',
          repartirLejos: false,
          radioRepartoMetros: 1000,
          promedioEstrellas: 4.5,
          totalCalificaciones: 28,
        },
      },
    },
  });

  // Cocinera 2
  const usuarioCocinera2 = await prisma.usuario.upsert({
    where: { email: 'rosa@menuahora.com' },
    update: {},
    create: {
      nombre: 'Rosa Huamán',
      email: 'rosa@menuahora.com',
      password,
      rol: 'COCINERA',
      telefono: '976543210',
      cocinera: {
        create: {
          nombreNegocio: 'El Rincón de Rosa',
          descripcion: 'Menú criollo todos los días',
          latitudCocina: -12.0500,
          longitudCocina: -77.0450,
          direccionReferencia: 'Jr. Huallaga 450, Cercado',
          repartirLejos: true,
          radioRepartoMetros: 2000,
          promedioEstrellas: 4.8,
          totalCalificaciones: 45,
        },
      },
    },
  });

  // Cliente
  const cliente = await prisma.usuario.upsert({
    where: { email: 'cliente@menuahora.com' },
    update: {},
    create: {
      nombre: 'Juan Pérez',
      email: 'cliente@menuahora.com',
      password,
      rol: 'CLIENTE',
      telefono: '965432100',
      cliente: {
        create: {
          latitudActual: -12.0470,
          longitudActual: -77.0435,
          direccion: 'Av. Petit Thouars 800, Lince',
        },
      },
    },
  });

  // Menús semanales para Cocinera 1
  const cocinera1 = await prisma.cocinera.findFirst({ where: { usuarioId: usuarioCocinera1.id } });
  const cocinera2 = await prisma.cocinera.findFirst({ where: { usuarioId: usuarioCocinera2.id } });

  if (cocinera1) {
    const lunes = new Date('2026-04-27');
    await prisma.menuSemanal.createMany({
      data: [
        { cocineraId: cocinera1.id, semanaInicio: lunes, dia: 'LUNES', descripcion: 'Arroz con pollo + ensalada + refresco', entrada1: 'Sopa criolla', entrada2: 'Crema de zapallo', precio: 13, cuposTotales: 24 },
        { cocineraId: cocinera1.id, semanaInicio: lunes, dia: 'LUNES', descripcion: 'Tallarines rojos con bistec + refresco', entrada1: 'Sopa criolla', entrada2: 'Crema de zapallo', precio: 13, cuposTotales: 24 },
        { cocineraId: cocinera1.id, semanaInicio: lunes, dia: 'MARTES', descripcion: 'Lomo saltado + arroz + refresco', entrada1: 'Sopa de pollo', entrada2: 'Ensalada fresca', precio: 13, cuposTotales: 24 },
        { cocineraId: cocinera1.id, semanaInicio: lunes, dia: 'MARTES', descripcion: 'Seco de res + frijoles + arroz + refresco', entrada1: 'Sopa de pollo', entrada2: 'Ensalada fresca', precio: 13, cuposTotales: 24 },
        { cocineraId: cocinera1.id, semanaInicio: lunes, dia: 'MIERCOLES', descripcion: 'Ají de gallina + arroz + refresco', entrada1: 'Caldo de gallina', precio: 13, cuposTotales: 24 },
        { cocineraId: cocinera1.id, semanaInicio: lunes, dia: 'JUEVES', descripcion: 'Pollo a la brasa + papas + refresco', entrada1: 'Sopa wantán', precio: 14, cuposTotales: 24 },
        { cocineraId: cocinera1.id, semanaInicio: lunes, dia: 'VIERNES', descripcion: 'Ceviche + cancha + chicha morada', entrada1: 'Chupe de camarones', precio: 15, cuposTotales: 24 },
      ],
    });

    // Productos carta Cocinera 1
    await prisma.productoCarta.createMany({
      data: [
        { cocineraId: cocinera1.id, nombre: 'Papa rellena', precio: 4, tipo: 'ADICIONAL', horarioInicio: '17:00', horarioFin: '22:00' },
        { cocineraId: cocinera1.id, nombre: 'Salchipapas personal', precio: 7, tipo: 'ADICIONAL', horarioInicio: '17:00', horarioFin: '22:00' },
        { cocineraId: cocinera1.id, nombre: 'Salchipapas familiar', precio: 12, tipo: 'ADICIONAL', horarioInicio: '17:00', horarioFin: '22:00' },
        { cocineraId: cocinera1.id, nombre: 'Anticuchos (porción)', precio: 8, tipo: 'CARTA', horarioInicio: '11:00', horarioFin: '21:00' },
        { cocineraId: cocinera1.id, nombre: 'Pollo broaster (porción)', precio: 10, tipo: 'CARTA', horarioInicio: '11:00', horarioFin: '21:00' },
      ],
    });
  }

  if (cocinera2) {
    const lunes = new Date('2026-04-27');
    await prisma.menuSemanal.createMany({
      data: [
        { cocineraId: cocinera2.id, semanaInicio: lunes, dia: 'LUNES', descripcion: 'Estofado de pollo + arroz + refresco', entrada1: 'Sopa de casa', precio: 13, cuposTotales: 24 },
        { cocineraId: cocinera2.id, semanaInicio: lunes, dia: 'LUNES', descripcion: 'Carapulcra + sopa seca + refresco', entrada1: 'Sopa de casa', precio: 13, cuposTotales: 24 },
        { cocineraId: cocinera2.id, semanaInicio: lunes, dia: 'MARTES', descripcion: 'Arroz chaufa + refresco', entrada1: 'Wantán frito', precio: 13, cuposTotales: 24 },
      ],
    });

    await prisma.productoCarta.createMany({
      data: [
        { cocineraId: cocinera2.id, nombre: 'Papa rellena', precio: 5, tipo: 'ADICIONAL', horarioInicio: '17:00', horarioFin: '22:00' },
        { cocineraId: cocinera2.id, nombre: 'Anticuchos con papas', precio: 10, tipo: 'CARTA', horarioInicio: '11:00', horarioFin: '21:00' },
      ],
    });
  }

  console.log('✅ Seed completado');
  console.log('👤 Admin:    admin@menuahora.com / 123456');
  console.log('🍳 Cocinera: maria@menuahora.com / 123456');
  console.log('🍳 Cocinera: rosa@menuahora.com / 123456');
  console.log('🛒 Cliente:  cliente@menuahora.com / 123456');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
