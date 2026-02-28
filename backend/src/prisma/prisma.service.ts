import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma';
import { PrismaNeon } from '@prisma/adapter-neon';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    const adapter = new PrismaNeon({ connectionString });
    super({ adapter } as any);
    this.logger.log('Prisma client initialized with Neon adapter');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
