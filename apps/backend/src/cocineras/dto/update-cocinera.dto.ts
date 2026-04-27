import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateCocineraDto {
  @IsOptional() @IsString() nombreNegocio?: string;
  @IsOptional() @IsString() descripcion?: string;
  @IsOptional() @IsNumber() latitudCocina?: number;
  @IsOptional() @IsNumber() longitudCocina?: number;
  @IsOptional() @IsString() direccionReferencia?: string;
  @IsOptional() @IsBoolean() repartirLejos?: boolean;
  @IsOptional() @IsInt() @Min(500) radioRepartoMetros?: number;
}
