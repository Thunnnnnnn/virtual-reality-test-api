import { Module } from '@nestjs/common';
import { TicketQueueEntryController } from './ticket-queue-entries.controller';
import { TicketQueueEntryService } from './ticket-queue-entries.service';

@Module({
  controllers: [TicketQueueEntryController],
  providers: [TicketQueueEntryService],
})
export class TicketQueueEntryModule {}
