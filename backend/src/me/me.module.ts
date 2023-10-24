import { Module } from '@nestjs/common';
import { MeService } from './me.service';
import { MeController } from './me.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [MeService],
  controllers: [MeController],
  imports: [PrismaModule, UsersModule, AuthModule],
})
export class MeModule {}
