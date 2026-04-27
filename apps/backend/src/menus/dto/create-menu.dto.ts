import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { DiaSemana } from '@prisma/client';

export class CreateMenuDto {
  @IsEnum(DiaSemana) dia: DiaSemana;
  @IsString() @IsNotEmpty() descripcion: string;
  @IsOptional() @IsString() entrada1?: string;
  @IsOptional() @IsString() entrada2?: string;
  @IsOptional() @IsBoolean() incluyeRefresco?: boolean;
  @IsNumber() precio: number;
  @IsOptional() @IsInt() @Min(1) cuposTotales?: number;
}

export class CreateMenuSemanalDto {
  @IsString() @IsNotEmpty() semanaInicio: string;
  menus: CreateMenuDto[];
}
