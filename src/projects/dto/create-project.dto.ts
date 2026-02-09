import { IsString, IsOptional, IsEnum, IsNumber, IsDateString, IsArray, Min, Max } from 'class-validator';

export class CreateProjectDto {
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsString()
    client: string;

    @IsOptional()
    @IsEnum(['Planning', 'In Progress', 'Review', 'Completed', 'Delayed', 'On Hold'])
    status?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    progress?: number;

    @IsOptional()
    @IsDateString()
    dueDate?: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    members?: number;

    @IsOptional()
    @IsNumber()
    budget?: number;

    @IsOptional()
    @IsEnum(['Paid', 'Unpaid', 'Pending', 'Partial'])
    paymentStatus?: string;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
}
