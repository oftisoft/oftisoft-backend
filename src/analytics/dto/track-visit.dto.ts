import { IsOptional, IsString } from 'class-validator';

export class TrackVisitDto {
  @IsString()
  page: string;

  @IsOptional()
  @IsString()
  referrer?: string;

  @IsOptional()
  @IsString()
  userId?: string;
}
