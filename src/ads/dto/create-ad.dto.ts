import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsUrl,
} from 'class-validator';
import { AdType, AdPosition, AdSize } from '../../entities/ad.entity';

export class CreateAdDto {
  @IsString()
  title: string;

  @IsEnum(AdType)
  type: AdType;

  @IsString()
  content: string;

  @IsOptional()
  @IsUrl()
  link?: string;

  @IsEnum(AdPosition)
  position: AdPosition;

  @IsEnum(AdSize)
  size: AdSize;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
