import { PartialType } from '@nestjs/mapped-types';
import { CreateQuoteDto } from './create-quote.dto';
import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';

export class UpdateQuoteDto extends PartialType(CreateQuoteDto) {
    @IsEnum(['requested', 'responded', 'accepted', 'rejected'])
    @IsOptional()
    status?: string;

    @IsObject()
    @IsOptional()
    proposal?: any;
}
