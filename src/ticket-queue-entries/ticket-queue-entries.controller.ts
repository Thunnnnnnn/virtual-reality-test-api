import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateTicketQueueEntryDto } from './dto/create-ticket-queue-entry.dto';
import { UpdateTicketQueueEntryDto } from './dto/update-ticket-queue-entry.dto';
import { TicketQueueEntryService } from './ticket-queue-entries.service';

@Controller('ticket-queue-entries')
export class TicketQueueEntryController {
  constructor(private readonly service: TicketQueueEntryService) {}

  @Post()
  create(@Body() dto: CreateTicketQueueEntryDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTicketQueueEntryDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
