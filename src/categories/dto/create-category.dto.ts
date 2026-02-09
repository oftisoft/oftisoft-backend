import { IsString, IsArray, IsOptional, IsNumber } from 'class-validator';

export class CreateCategoryDto {
    @IsString()
    name: string;

    @IsString()
    slug: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    subcategories?: string[];

    @IsOptional()
    @IsNumber()
    order?: number;
}
