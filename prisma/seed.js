const { PrismaClient } = require('@prisma/client');
const entries = require('./seed-data.json');

const prisma = new PrismaClient();

async function main() {
  for (const { id, ...data } of entries) {
    await prisma.ticketQueueEntry.upsert({ where: { id }, update: data, create: { id, ...data } });
  }
  console.log(`Seeded ${entries.length} ticket queue entries`);
}

main().finally(() => prisma.$disconnect());
