import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { WebsocketService } from 'src/chat/websocket.service';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [WebsocketService, GameService, WebsocketService],
  imports: [UsersModule, AuthModule, JwtModule],
  exports: [GameService],
  controllers: [GameController],
})
export class GameModule { }
