import { Module } from '@nestjs/common';
import { FriendController } from './friend.controller';
import { FriendService } from './friend.service';
import { FriendRepository } from './friend.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatModule } from 'src/chat/chat.module';
import { ChatService } from 'src/chat/chat.service';
import { WebsocketService } from 'src/chat/websocket.service';

@Module({
  imports: [ChatModule],
  controllers: [FriendController],
  providers: [FriendService, FriendRepository, PrismaService, WebsocketService],
})
export class FriendModule { }
