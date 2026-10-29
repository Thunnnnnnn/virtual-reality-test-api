import { Injectable } from '@nestjs/common';
import { CreateFanGroupDto } from './dto/create-fan-group.dto';
import { UpdateFanGroupDto } from './dto/update-fan-group.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FanGroupService {
  constructor(private readonly prisma: PrismaService) {}

  create({ entryIds, ...data }: CreateFanGroupDto) {
    return this.prisma.fanGroup.create({
      data: { ...data, entries: { connect: entryIds?.map((id) => ({ id })) } },
    });
  }

  findAll() {
    return this.prisma.fanGroup.findMany();
  }

  findOne(id: string) {
    return this.prisma.fanGroup.findUniqueOrThrow({ where: { id } });
  }

  update(id: string, { entryIds, ...data }: UpdateFanGroupDto) {
    return this.prisma.fanGroup.update({
      where: { id },
      data: { ...data, ...(entryIds && { entries: { set: entryIds.map((id) => ({ id })) } }) },
    });
  }

  remove(id: string) {
    return this.prisma.fanGroup.delete({ where: { id } });
  }
}
