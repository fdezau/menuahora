import { IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class DetallePedidoDto {
  @IsOptional() @IsInt() menuSemanalId?: number;
  @IsOptional() @IsInt() productoCartaId?: number;
  @IsInt() @Min(1) cantidad: number;
}

export class CreatePedidoDto {
  @IsInt() cocineraId: number;
  @IsString() @IsNotEmpty() horaEntregaElegida: string;
  @IsString() @IsNotEmpty() direccionEntrega: string;
  @IsOptional() @IsNumber() latitudEntrega?: number;
  @IsOptional() @IsNumber() longitudEntrega?: number;
  @IsString() @IsNotEmpty() culqiToken: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetallePedidoDto)
  detalles: DetallePedidoDto[];
}
