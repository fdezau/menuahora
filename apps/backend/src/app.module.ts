import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CocinerasModule } from './cocineras/cocineras.module';
import { MenusModule } from './menus/menus.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { CalificacionesModule } from './calificaciones/calificaciones.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    CocinerasModule,
    MenusModule,
    PedidosModule,
    CalificacionesModule,
  ],
})
export class AppModule {}
