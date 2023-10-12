import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { TokenStrategy } from './token.strategy';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './auth.constants';
import { JwtStrategy } from './jwt.strategy';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersService } from 'src/users/users.service';
import { UsersRepository } from 'src/users/users.repository';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '40d' },
    }),
    PrismaModule,
  ],
  providers: [
    AuthService,
    TokenStrategy,
    JwtStrategy,
    UsersService,
    UsersRepository,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
