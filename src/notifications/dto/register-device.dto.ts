import { IsString, IsOptional } from 'class-validator';

export class RegisterDeviceDto {
  @IsString()
  token: string;

  @IsString()
  @IsOptional()
  platform?: string;
}

export class UnregisterDeviceDto {
  @IsString()
  token: string;
}
