import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class CreateQuoteDto {
  @IsString()
  @IsNotEmpty()
  serviceType: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  budget: string;
}
