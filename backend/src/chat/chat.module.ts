import { UsersModule } from 'src/users/users.module';
import { SocketGateway } from './chat.gateway';
import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { ChatService } from './chat.service';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersRepository } from 'src/users/users.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatRepository } from './chat.repository';
import { ChatController } from './chat.controller';
import { WebsocketService } from './websocket.service';
import { GameModule } from 'src/game/game.module';
import { GameService } from 'src/game/game.service';


@Module({
  providers: [
    WebsocketService,
    SocketGateway,
    ChatService,
    AuthService,
    UsersService,
    UsersRepository,
    PrismaService,
    ChatRepository,
  ],
  controllers: [ChatController],
  imports: [UsersModule, AuthModule, JwtModule, forwardRef(() => GameModule)],
  exports: [ChatService, SocketGateway, WebsocketService],
})
export class ChatModule { }
