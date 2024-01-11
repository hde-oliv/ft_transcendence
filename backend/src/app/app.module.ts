import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { ChatModule } from 'src/chat/chat.module';
import { MeModule } from 'src/me/me.module';
import { GameModule } from 'src/game/game.module';
import { FriendModule } from 'src/friend/friend.module';
import { MatchModule } from 'src/match/match.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    ChatModule,
    GameModule,
    MeModule,
    FriendModule,
    MatchModule,
    LoggerModule.forRoot({
      pinoHttp: {
        customProps: (req, res) => ({
          context: 'HTTP',
        }),
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
          },
        },
      },
    }),
    ConfigModule.forRoot(),
  ],
})
export class AppModule { }
