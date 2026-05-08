import { IsString, IsOptional, IsObject, IsIn } from 'class-validator';

export class UpdatePageContentDto {
  @IsString()
  @IsOptional()
  pageKey?: string;

  @IsObject()
  @IsOptional()
  content?: any;

  @IsString()
  @IsOptional()
  @IsIn(['draft', 'published'])
  status?: string;
}
