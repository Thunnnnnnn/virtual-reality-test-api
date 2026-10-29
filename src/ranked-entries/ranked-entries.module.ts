import { Module } from '@nestjs/common';
import { RankedEntryController } from './ranked-entries.controller';
import { RankedEntryService } from './ranked-entries.service';

@Module({
  controllers: [RankedEntryController],
  providers: [RankedEntryService],
})
export class RankedEntryModule {}
