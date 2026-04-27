import { Module } from '@nestjs/common';
import { CocinerasService } from './cocineras.service';
import { CocinerasController } from './cocineras.controller';

@Module({
  controllers: [CocinerasController],
  providers: [CocinerasService],
  exports: [CocinerasService],
})
export class CocinerasModule {}
