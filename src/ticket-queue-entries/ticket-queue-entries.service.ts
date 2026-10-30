import { Injectable } from '@nestjs/common';
import { CreateTicketQueueEntryDto } from './dto/create-ticket-queue-entry.dto';
import { UpdateTicketQueueEntryDto } from './dto/update-ticket-queue-entry.dto';
import { buildFrontRowUpgradeQueue, UpgradeOptions } from './front-row-upgrade';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TicketQueueEntryService {
  constructor(private readonly prisma: PrismaService) { }

  async create(data: CreateTicketQueueEntryDto) {
    return await this.prisma.ticketQueueEntry.create({ data });
  }

  async findAll() {
    return await this.prisma.ticketQueueEntry.findMany();
  }

  async findOne(id: string) {
    return await this.prisma.ticketQueueEntry.findUniqueOrThrow({ where: { id } });
  }

  async update(id: string, data: UpdateTicketQueueEntryDto) {
    return await this.prisma.ticketQueueEntry.update({ where: { id }, data });
  }

  async remove(id: string) {
    return await this.prisma.ticketQueueEntry.delete({ where: { id } });
  }

  async getFrontRowUpgradeResult(now: Date = new Date(), options: UpgradeOptions = {}) {
    const entries = await this.prisma.ticketQueueEntry.findMany();
    return buildFrontRowUpgradeQueue(entries, now, options);
  }
}
