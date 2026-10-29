import { Module } from '@nestjs/common';
import { ExcludedEntryController } from './excluded-entries.controller';
import { ExcludedEntryService } from './excluded-entries.service';

@Module({
  controllers: [ExcludedEntryController],
  providers: [ExcludedEntryService],
})
export class ExcludedEntryModule {}
