import { IsOptional, IsString } from 'class-validator';

export class TrackEventDto {
  @IsString()
  eventType: string;

  @IsOptional()
  @IsString()
  eventLabel?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  metadata?: Record<string, unknown>;
}
