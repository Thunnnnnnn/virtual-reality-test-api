import { IsArray, IsNumber, IsString } from 'class-validator';

export class CreateRankedEntryDto {
  @IsString()
  entryId: string;

  @IsNumber()
  score: number;

  @IsArray()
  @IsString({ each: true })
  reasons: string[];
}
