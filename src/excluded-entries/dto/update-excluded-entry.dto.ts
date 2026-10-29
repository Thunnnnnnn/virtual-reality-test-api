import { PartialType } from '@nestjs/mapped-types';
import { CreateExcludedEntryDto } from './create-excluded-entry.dto';

export class UpdateExcludedEntryDto extends PartialType(CreateExcludedEntryDto) {}
