import { Module } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';
import { MenusModule } from '../menus/menus.module';

@Module({
  imports: [MenusModule],
  controllers: [PedidosController],
  providers: [PedidosService],
})
export class PedidosModule {}
