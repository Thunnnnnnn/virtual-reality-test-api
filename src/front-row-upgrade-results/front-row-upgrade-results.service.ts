import { Injectable } from '@nestjs/common';
import { CreateFrontRowUpgradeResultDto } from './dto/create-front-row-upgrade-result.dto';
import { UpdateFrontRowUpgradeResultDto } from './dto/update-front-row-upgrade-result.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FrontRowUpgradeResultService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateFrontRowUpgradeResultDto) {
    return this.prisma.frontRowUpgradeResult.create({ data });
  }

  findAll() {
    return this.prisma.frontRowUpgradeResult.findMany();
  }

  findOne(id: string) {
    return this.prisma.frontRowUpgradeResult.findUniqueOrThrow({ where: { id } });
  }

  update(id: string, data: UpdateFrontRowUpgradeResultDto) {
    return this.prisma.frontRowUpgradeResult.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.frontRowUpgradeResult.delete({ where: { id } });
  }
}
