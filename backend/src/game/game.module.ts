import { Module, forwardRef } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ChatModule } from 'src/chat/chat.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { GameRepository } from './game.reposotory';

@Module({
  providers: [GameService, GameRepository],
  imports: [UsersModule, AuthModule, JwtModule, forwardRef(() => ChatModule), PrismaModule],
  exports: [GameService, GameRepository],
  controllers: [GameController],
})
export class GameModule { }
