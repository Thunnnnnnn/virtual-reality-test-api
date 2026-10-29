import { Module } from '@nestjs/common';
import { FanGroupController } from './fan-groups.controller';
import { FanGroupService } from './fan-groups.service';

@Module({
  controllers: [FanGroupController],
  providers: [FanGroupService],
})
export class FanGroupModule {}
