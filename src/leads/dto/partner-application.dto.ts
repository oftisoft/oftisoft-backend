import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PartnerApplicationDto {
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsString()
  @IsNotEmpty()
  partnerType: string;

  @IsOptional()
  @IsString()
  message?: string;
}
