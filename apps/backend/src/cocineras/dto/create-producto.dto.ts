import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { TipoProducto } from '@prisma/client';

export class CreateProductoDto {
  @IsString() @IsNotEmpty() nombre: string;
  @IsOptional() @IsString() descripcion?: string;
  @IsNumber() precio: number;
  @IsEnum(TipoProducto) tipo: TipoProducto;
  @IsOptional() @IsString() horarioInicio?: string;
  @IsOptional() @IsString() horarioFin?: string;
}
