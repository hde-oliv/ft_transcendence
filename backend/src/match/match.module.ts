import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { ChatModule } from 'src/chat/chat.module';
import { WebsocketService } from 'src/chat/websocket.service';
import { SocketGateway } from 'src/chat/chat.gateway';
import { UsersRepository } from 'src/users/users.repository';
import { UsersService } from 'src/users/users.service';
import { MatchController } from './match.controller';
import { MatchService } from './match.service';
import { QueueModule } from 'src/queue/queue.module';

@Module({
  providers: [
    UsersService,
    MatchService,
  ],
  controllers: [MatchController],
  imports: [PrismaModule, UsersModule, AuthModule, ChatModule, QueueModule],
  exports: []
})
export class MatchModule { }
