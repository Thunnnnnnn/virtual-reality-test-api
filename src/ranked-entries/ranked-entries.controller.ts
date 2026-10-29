import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateRankedEntryDto } from './dto/create-ranked-entry.dto';
import { UpdateRankedEntryDto } from './dto/update-ranked-entry.dto';
import { RankedEntryService } from './ranked-entries.service';

@Controller('ranked-entries')
export class RankedEntryController {
  constructor(private readonly service: RankedEntryService) {}

  @Post()
  create(@Body() dto: CreateRankedEntryDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateRankedEntryDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
