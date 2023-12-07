import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ChatModule } from 'src/chat/chat.module';
import { WebsocketService } from 'src/chat/websocket.service';

@Module({
  controllers: [UsersController],
  providers: [UsersRepository, UsersService],
  imports: [PrismaModule],
  exports: [UsersRepository],
})
export class UsersModule { }
