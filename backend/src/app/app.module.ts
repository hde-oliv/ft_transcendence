import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [UserModule, AuthModule, ConfigModule.forRoot()],
})
export class AppModule {}
