import { Module, forwardRef } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  providers: [GameService],
  imports: [UsersModule, AuthModule, JwtModule, forwardRef(() => ChatModule)],
  exports: [GameService],
  controllers: [GameController],
})
export class GameModule { }
