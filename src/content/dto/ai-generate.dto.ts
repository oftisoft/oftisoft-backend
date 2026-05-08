import { IsString, IsOptional, MaxLength } from 'class-validator';

export class AiGenerateDto {
  @IsString()
  prompt: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  fieldType?: string; // e.g. 'meta_title', 'meta_description', 'keywords'

  @IsString()
  @IsOptional()
  @MaxLength(80)
  pageKey?: string;

  /** Section ID and field name for contextual generation */
  @IsString()
  @IsOptional()
  @MaxLength(120)
  sectionId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  fieldName?: string;

  /** Existing content + page structure (JSON string, max ~4KB) for consistency */
  @IsString()
  @IsOptional()
  @MaxLength(6000)
  context?: string;
}
