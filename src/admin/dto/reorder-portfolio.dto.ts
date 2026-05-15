import { IsArray, IsString, IsInt, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

class ReorderItem {
  @IsString()
  id: string;

  @IsInt()
  order: number;
}

export class ReorderPortfolioDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReorderItem)
  items: ReorderItem[];
}
