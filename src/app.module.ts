import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './users/users.module';
import { TicketQueueEntryModule } from './ticket-queue-entries/ticket-queue-entries.module';
import { FrontRowUpgradeResultModule } from './front-row-upgrade-results/front-row-upgrade-results.module';
import { RankedEntryModule } from './ranked-entries/ranked-entries.module';
import { FanGroupModule } from './fan-groups/fan-groups.module';
import { ExcludedEntryModule } from './excluded-entries/excluded-entries.module';

@Module({
  imports: [PrismaModule, UserModule, TicketQueueEntryModule, FrontRowUpgradeResultModule, RankedEntryModule, FanGroupModule, ExcludedEntryModule],
  controllers: [AppController],
})
export class AppModule {}
