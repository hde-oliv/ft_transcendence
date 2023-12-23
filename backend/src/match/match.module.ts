import { Module, forwardRef } from '@nestjs/common';

import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { ChatModule } from 'src/chat/chat.module';
import { UsersService } from 'src/users/users.service';
import { MatchController } from './match.controller';
import { MatchService } from './match.service';
import { QueueModule } from 'src/queue/queue.module';
import { MatchRepository } from './match.repository';
import { UsersRepository } from 'src/users/users.repository';
import { GameService } from 'src/game/game.service';
import { GameModule } from 'src/game/game.module';

@Module({
  providers: [
    MatchService,
    MatchRepository,
    UsersRepository,
    UsersService
  ],
  controllers: [MatchController],
  imports: [PrismaModule, UsersModule, AuthModule, QueueModule, ChatModule, GameModule],
  exports: [MatchRepository]
})
export class MatchModule { }
