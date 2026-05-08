import { IsString, IsNotEmpty } from 'class-validator';

export class RejectProductDto {
  @IsString()
  @IsNotEmpty()
  reason: string;
}
