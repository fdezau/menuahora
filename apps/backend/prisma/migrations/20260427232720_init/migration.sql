-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'COCINERA', 'CLIENTE');

-- CreateEnum
CREATE TYPE "EstadoPedido" AS ENUM ('RESERVADO', 'PAGADO', 'EN_PREPARACION', 'LISTO_PARA_ENVIO', 'ENVIADO', 'ENTREGADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "TipoProducto" AS ENUM ('MENU_DIA', 'CARTA', 'ADICIONAL');

-- CreateEnum
CREATE TYPE "DiaSemana" AS ENUM ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "telefono" TEXT,
    "rol" "Rol" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cocineras" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "nombreNegocio" TEXT NOT NULL,
    "descripcion" TEXT,
    "latitudCocina" DOUBLE PRECISION,
    "longitudCocina" DOUBLE PRECISION,
    "direccionReferencia" TEXT,
    "repartirLejos" BOOLEAN NOT NULL DEFAULT false,
    "radioRepartoMetros" INTEGER NOT NULL DEFAULT 1000,
    "promedioEstrellas" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCalificaciones" INTEGER NOT NULL DEFAULT 0,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cocineras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "latitudActual" DOUBLE PRECISION,
    "longitudActual" DOUBLE PRECISION,
    "direccion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menus_semanal" (
    "id" SERIAL NOT NULL,
    "cocineraId" INTEGER NOT NULL,
    "semanaInicio" TIMESTAMP(3) NOT NULL,
    "dia" "DiaSemana" NOT NULL,
    "descripcion" TEXT NOT NULL,
    "entrada1" TEXT,
    "entrada2" TEXT,
    "incluyeRefresco" BOOLEAN NOT NULL DEFAULT true,
    "precio" DOUBLE PRECISION NOT NULL,
    "cuposTotales" INTEGER NOT NULL DEFAULT 24,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menus_semanal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "confirmaciones_diarias" (
    "id" SERIAL NOT NULL,
    "menuSemanalId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "cuposDisponibles" INTEGER NOT NULL DEFAULT 24,
    "confirmado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "confirmaciones_diarias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos_carta" (
    "id" SERIAL NOT NULL,
    "cocineraId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "precio" DOUBLE PRECISION NOT NULL,
    "tipo" "TipoProducto" NOT NULL,
    "horarioInicio" TEXT NOT NULL DEFAULT '11:00',
    "horarioFin" TEXT NOT NULL DEFAULT '21:00',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "productos_carta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "cocineraId" INTEGER NOT NULL,
    "estado" "EstadoPedido" NOT NULL DEFAULT 'PAGADO',
    "horaEntregaElegida" TEXT NOT NULL,
    "direccionEntrega" TEXT NOT NULL,
    "latitudEntrega" DOUBLE PRECISION,
    "longitudEntrega" DOUBLE PRECISION,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "comisionPlataforma" DOUBLE PRECISION NOT NULL,
    "comisionPasarela" DOUBLE PRECISION NOT NULL,
    "totalPagado" DOUBLE PRECISION NOT NULL,
    "gananciaCocinera" DOUBLE PRECISION NOT NULL,
    "culqiChargeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detalles_pedido" (
    "id" SERIAL NOT NULL,
    "pedidoId" INTEGER NOT NULL,
    "menuSemanalId" INTEGER,
    "productoCartaId" INTEGER,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "detalles_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos" (
    "id" SERIAL NOT NULL,
    "pedidoId" INTEGER NOT NULL,
    "culqiChargeId" TEXT,
    "monto" DOUBLE PRECISION NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'COMPLETADO',
    "metodoPago" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calificaciones" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "cocineraId" INTEGER NOT NULL,
    "estrellas" INTEGER NOT NULL,
    "comentario" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "cocineras_usuarioId_key" ON "cocineras"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_usuarioId_key" ON "clientes"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "confirmaciones_diarias_menuSemanalId_fecha_key" ON "confirmaciones_diarias"("menuSemanalId", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "pagos_pedidoId_key" ON "pagos"("pedidoId");

-- AddForeignKey
ALTER TABLE "cocineras" ADD CONSTRAINT "cocineras_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menus_semanal" ADD CONSTRAINT "menus_semanal_cocineraId_fkey" FOREIGN KEY ("cocineraId") REFERENCES "cocineras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "confirmaciones_diarias" ADD CONSTRAINT "confirmaciones_diarias_menuSemanalId_fkey" FOREIGN KEY ("menuSemanalId") REFERENCES "menus_semanal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos_carta" ADD CONSTRAINT "productos_carta_cocineraId_fkey" FOREIGN KEY ("cocineraId") REFERENCES "cocineras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_cocineraId_fkey" FOREIGN KEY ("cocineraId") REFERENCES "cocineras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalles_pedido" ADD CONSTRAINT "detalles_pedido_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalles_pedido" ADD CONSTRAINT "detalles_pedido_menuSemanalId_fkey" FOREIGN KEY ("menuSemanalId") REFERENCES "menus_semanal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalles_pedido" ADD CONSTRAINT "detalles_pedido_productoCartaId_fkey" FOREIGN KEY ("productoCartaId") REFERENCES "productos_carta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calificaciones" ADD CONSTRAINT "calificaciones_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calificaciones" ADD CONSTRAINT "calificaciones_cocineraId_fkey" FOREIGN KEY ("cocineraId") REFERENCES "cocineras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
