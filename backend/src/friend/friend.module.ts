import { Module } from '@nestjs/common';
import { FriendController } from './friend.controller';
import { FriendService } from './friend.service';
import { FriendRepository } from './friend.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  providers: [FriendService, FriendRepository, PrismaService],
  controllers: [FriendController],
  imports: [ChatModule],
})
export class FriendModule { }
