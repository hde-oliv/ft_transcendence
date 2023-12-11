import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { GameController } from './game.controller';
import { WebsocketService } from 'src/chat/websocket.service';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [WebsocketService, GameService, GameGateway],
  imports: [UsersModule, AuthModule, JwtModule],
  controllers: [GameController],
})
export class GameModule {}
