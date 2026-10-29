import { IsString } from 'class-validator';

export class CreateExcludedEntryDto {
  @IsString()
  resultId: string;

  @IsString()
  entryId: string;

  @IsString()
  reason: string;
}
