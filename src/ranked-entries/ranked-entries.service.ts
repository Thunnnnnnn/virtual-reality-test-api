import { Injectable } from '@nestjs/common';
import { CreateRankedEntryDto } from './dto/create-ranked-entry.dto';
import { UpdateRankedEntryDto } from './dto/update-ranked-entry.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RankedEntryService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateRankedEntryDto) {
    return this.prisma.rankedEntry.create({ data });
  }

  findAll() {
    return this.prisma.rankedEntry.findMany();
  }

  findOne(id: string) {
    return this.prisma.rankedEntry.findUniqueOrThrow({ where: { id } });
  }

  update(id: string, data: UpdateRankedEntryDto) {
    return this.prisma.rankedEntry.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.rankedEntry.delete({ where: { id } });
  }
}
