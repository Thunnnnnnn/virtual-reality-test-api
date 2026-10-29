import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateTicketQueueEntryDto {
  @IsString()
  fanId: string;

  @IsString()
  fanName: string;

  @IsOptional()
  @IsString()
  ticketValue?: string;

  @IsString()
  joinedQueueAt: string;

  @IsString()
  eventStartsAt: string;

  @IsString()
  status: string;

  @IsOptional()
  @IsInt()
  loyaltyPoints?: number;

  @IsOptional()
  @IsInt()
  upgradesLast30Days?: number;

  @IsOptional()
  @IsString()
  membership?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  deviceId?: string;

  @IsOptional()
  @IsString()
  paymentAccount?: string;
}
