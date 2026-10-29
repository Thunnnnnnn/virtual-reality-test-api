import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateFanGroupDto } from './dto/create-fan-group.dto';
import { UpdateFanGroupDto } from './dto/update-fan-group.dto';
import { FanGroupService } from './fan-groups.service';

@Controller('fan-groups')
export class FanGroupController {
  constructor(private readonly service: FanGroupService) {}

  @Post()
  create(@Body() dto: CreateFanGroupDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateFanGroupDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
