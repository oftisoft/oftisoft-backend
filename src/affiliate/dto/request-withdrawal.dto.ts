import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { WithdrawalMethod } from '../../entities/affiliate-withdrawal.entity';

export class RequestWithdrawalDto {
  @IsNumber()
  amount: number;

  @IsEnum(WithdrawalMethod)
  method: WithdrawalMethod;

  @IsOptional()
  paymentDetails?: Record<string, unknown>;
}
