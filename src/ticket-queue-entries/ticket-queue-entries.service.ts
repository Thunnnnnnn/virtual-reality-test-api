import { Injectable } from '@nestjs/common';
import { CreateTicketQueueEntryDto } from './dto/create-ticket-queue-entry.dto';
import { UpdateTicketQueueEntryDto } from './dto/update-ticket-queue-entry.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TicketQueueEntryService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateTicketQueueEntryDto) {
    return this.prisma.ticketQueueEntry.create({ data });
  }

  findAll() {
    return this.prisma.ticketQueueEntry.findMany();
  }

  findOne(id: string) {
    return this.prisma.ticketQueueEntry.findUniqueOrThrow({ where: { id } });
  }

  update(id: string, data: UpdateTicketQueueEntryDto) {
    return this.prisma.ticketQueueEntry.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.ticketQueueEntry.delete({ where: { id } });
  }
}
