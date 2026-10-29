import { PartialType } from '@nestjs/mapped-types';
import { CreateTicketQueueEntryDto } from './create-ticket-queue-entry.dto';

export class UpdateTicketQueueEntryDto extends PartialType(CreateTicketQueueEntryDto) {}
