import { Transform } from 'class-transformer';
import { IsBoolean, IsISO8601, IsOptional } from 'class-validator';

const toBoolean = ({ value }: { value: unknown }) => value === true || value === 'true';

export class FrontRowUpgradeQueryDto {
  @IsOptional()
  @IsISO8601()
  now?: string;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  rushHour?: boolean;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  vipHour?: boolean;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  fairQueue?: boolean;
}
