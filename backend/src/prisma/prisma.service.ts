import { Injectable, OnModuleInit, INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
    await this.users.updateMany({
      data: {
        online: false,
        status: 'offline'
      }
    })
  }
  async onModuleDestroy() {
    await this.users.updateMany({
      data: {
        online: false,
        status: 'offline'
      }
    })
    await this.$disconnect();
  }
}
