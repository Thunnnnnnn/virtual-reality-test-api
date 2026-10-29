import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateFrontRowUpgradeResultDto } from './dto/create-front-row-upgrade-result.dto';
import { UpdateFrontRowUpgradeResultDto } from './dto/update-front-row-upgrade-result.dto';
import { FrontRowUpgradeResultService } from './front-row-upgrade-results.service';

@Controller('front-row-upgrade-results')
export class FrontRowUpgradeResultController {
  constructor(private readonly service: FrontRowUpgradeResultService) {}

  @Post()
  create(@Body() dto: CreateFrontRowUpgradeResultDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateFrontRowUpgradeResultDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
