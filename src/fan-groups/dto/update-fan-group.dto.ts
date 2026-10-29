import { PartialType } from '@nestjs/mapped-types';
import { CreateFanGroupDto } from './create-fan-group.dto';

export class UpdateFanGroupDto extends PartialType(CreateFanGroupDto) {}
