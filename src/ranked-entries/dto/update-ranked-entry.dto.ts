import { PartialType } from '@nestjs/mapped-types';
import { CreateRankedEntryDto } from './create-ranked-entry.dto';

export class UpdateRankedEntryDto extends PartialType(CreateRankedEntryDto) {}
