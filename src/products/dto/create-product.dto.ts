import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;

  @IsString()
  category: string;

  @IsString()
  subcategory: string;

  @IsString()
  image: string;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsArray()
  @IsString({ each: true })
  features: string[];

  @IsArray()
  @IsString({ each: true })
  screenshots: string[];

  @IsOptional()
  @IsUrl()
  demoUrl?: string;

  @IsOptional()
  @IsUrl()
  docUrl?: string;

  @IsArray()
  @IsString({ each: true })
  compatibility: string[];

  @IsString()
  version: string;

  @IsString()
  updatePolicy: string;

  @IsNumber()
  licenseRegular: number;

  @IsNumber()
  licenseExtended: number;
}
