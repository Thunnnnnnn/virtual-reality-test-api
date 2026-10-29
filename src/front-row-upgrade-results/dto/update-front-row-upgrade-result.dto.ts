import { PartialType } from '@nestjs/mapped-types';
import { CreateFrontRowUpgradeResultDto } from './create-front-row-upgrade-result.dto';

export class UpdateFrontRowUpgradeResultDto extends PartialType(CreateFrontRowUpgradeResultDto) {}
