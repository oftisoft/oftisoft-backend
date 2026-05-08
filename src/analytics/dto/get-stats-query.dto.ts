import { IsOptional, IsString } from 'class-validator';

export class GetStatsQueryDto {
  @IsOptional()
  @IsString()
  timeRange?: string; // 'day' | 'week' | 'month'
}
