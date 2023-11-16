import { UsersModule } from 'src/users/users.module';
import { ChatGateway } from './chat.gateway';
import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { ChatService } from './chat.service';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersRepository } from 'src/users/users.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatRepository } from './chat.repository';
import { ChatController } from './chat.controller';

@Module({
  providers: [
    ChatGateway,
    ChatService,
    AuthService,
    UsersService,
    UsersRepository,
    PrismaService,
    ChatRepository,
  ],
  controllers: [ChatController],
  imports: [UsersModule, AuthModule, JwtModule],
  exports: [ChatService],
})
export class ChatModule {}
