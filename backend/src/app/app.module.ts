import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { CatsModule } from 'src/cats/cats.module';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    CatsModule,
    ChatModule,
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
export class AppModule {}
