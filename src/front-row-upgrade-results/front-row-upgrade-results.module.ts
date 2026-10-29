import { Module } from '@nestjs/common';
import { FrontRowUpgradeResultController } from './front-row-upgrade-results.controller';
import { FrontRowUpgradeResultService } from './front-row-upgrade-results.service';

@Module({
  controllers: [FrontRowUpgradeResultController],
  providers: [FrontRowUpgradeResultService],
})
export class FrontRowUpgradeResultModule {}
