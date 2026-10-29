import { IsOptional, IsString } from 'class-validator';

export class CreateFrontRowUpgradeResultDto {
  @IsOptional()
  @IsString()
  winnerId?: string;
}
