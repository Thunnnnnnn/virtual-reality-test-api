import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './users/users.module';
import { TicketQueueEntryModule } from './ticket-queue-entries/ticket-queue-entries.module';

@Module({
  imports: [PrismaModule, UserModule, TicketQueueEntryModule],
  controllers: [AppController],
})
export class AppModule {}
