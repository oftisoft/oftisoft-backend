import { IsString, IsOptional, IsArray, IsInt, IsBoolean } from 'class-validator';

export class CreateTeamMemberDto {
  @IsString()
  name: string;

  @IsString()
  role: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  socialLinks?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsInt()
  @IsOptional()
  order?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
