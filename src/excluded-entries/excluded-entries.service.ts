import { Injectable } from '@nestjs/common';
import { CreateExcludedEntryDto } from './dto/create-excluded-entry.dto';
import { UpdateExcludedEntryDto } from './dto/update-excluded-entry.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExcludedEntryService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateExcludedEntryDto) {
    return this.prisma.excludedEntry.create({ data });
  }

  findAll() {
    return this.prisma.excludedEntry.findMany();
  }

  findOne(id: string) {
    return this.prisma.excludedEntry.findUniqueOrThrow({ where: { id } });
  }

  update(id: string, data: UpdateExcludedEntryDto) {
    return this.prisma.excludedEntry.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.excludedEntry.delete({ where: { id } });
  }
}
