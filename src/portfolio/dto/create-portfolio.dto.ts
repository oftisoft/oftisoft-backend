import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
  IsArray,
} from 'class-validator';

export class CreatePortfolioDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsString()
  category: string;

  @IsString()
  client: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  longDescription?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  screenshots?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  gradient?: string;

  @IsOptional()
  @IsString()
  stats?: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsEnum(['draft', 'published'])
  status?: string;

  @IsOptional()
  @IsInt()
  order?: number;
}
