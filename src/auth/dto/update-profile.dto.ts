import { IsString, IsOptional, IsEmail, MinLength, IsBoolean } from 'class-validator';

export class UpdateProfileDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    jobTitle?: string;

    @IsString()
    @IsOptional()
    bio?: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    city?: string;

    @IsString()
    @IsOptional()
    state?: string;

    @IsString()
    @IsOptional()
    zipCode?: string;

    @IsString()
    @IsOptional()
    unit?: string;

    @IsBoolean()
    @IsOptional()
    emailNotifications?: boolean;

    @IsBoolean()
    @IsOptional()
    pushNotifications?: boolean;

    @IsBoolean()
    @IsOptional()
    smsNotifications?: boolean;

    @IsBoolean()
    @IsOptional()
    marketingNotifications?: boolean;

    @IsString()
    @IsOptional()
    avatarUrl?: string;

    @IsBoolean()
    @IsOptional()
    artifactDeploymentNotifications?: boolean;

    @IsBoolean()
    @IsOptional()
    mentionNotifications?: boolean;

    @IsBoolean()
    @IsOptional()
    milestoneNotifications?: boolean;

    @IsBoolean()
    @IsOptional()
    allocationNotifications?: boolean;

    @IsBoolean()
    @IsOptional()
    ledgerNotifications?: boolean;

    @IsBoolean()
    @IsOptional()
    transactionNotifications?: boolean;

    @IsBoolean()
    @IsOptional()
    loginAlertNotifications?: boolean;

    @IsBoolean()
    @IsOptional()
    securityAlertNotifications?: boolean;

    @IsBoolean()
    @IsOptional()
    kernelUpdateNotifications?: boolean;
}
