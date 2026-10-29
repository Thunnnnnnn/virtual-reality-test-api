import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateFanGroupDto {
  @IsString()
  resultId: string;

  @IsOptional()
  @IsString()
  representativeId?: string;

  @IsArray()
  @IsString({ each: true })
  connectionReasons: string[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  entryIds?: string[];
}
