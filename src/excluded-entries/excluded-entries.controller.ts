import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateExcludedEntryDto } from './dto/create-excluded-entry.dto';
import { UpdateExcludedEntryDto } from './dto/update-excluded-entry.dto';
import { ExcludedEntryService } from './excluded-entries.service';

@Controller('excluded-entries')
export class ExcludedEntryController {
  constructor(private readonly service: ExcludedEntryService) {}

  @Post()
  create(@Body() dto: CreateExcludedEntryDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateExcludedEntryDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
