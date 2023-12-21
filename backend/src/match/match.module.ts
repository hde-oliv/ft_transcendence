import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { ChatModule } from 'src/chat/chat.module';
import { UsersService } from 'src/users/users.service';
import { MatchController } from './match.controller';
import { MatchService } from './match.service';
import { QueueModule } from 'src/queue/queue.module';
import { MatchRepository } from './match.repository';

@Module({
  providers: [
    UsersService,
    MatchService,
    MatchRepository,
  ],
  controllers: [MatchController],
  imports: [PrismaModule, UsersModule, AuthModule, ChatModule, QueueModule],
  exports: [MatchRepository]
})
export class MatchModule { }
