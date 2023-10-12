import { UniqueTokenStrategy } from 'passport-unique-token';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { authResponse42, user42Data, user42Schema } from './auth.model';
import { AxiosResponse } from 'axios';
import { UsersService } from 'src/users/users.service';
import { createUserSchema, CreateUserDto } from 'src/users/dto/create-user-dto';
import { Users as UserEntity } from '@prisma/client';

@Injectable()
export class TokenStrategy extends PassportStrategy(
  UniqueTokenStrategy,
  'local',
) {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {
    super();
  }

  private readonly logger = new Logger(TokenStrategy.name);

  // NOTE: Is named token instead of code 'cause Passport
  async validate(token: string): Promise<any> {
    this.logger.log(`Start validating code. [code=${token}]`);

    let authData: authResponse42;
    let userData: user42Data;
    let response: AxiosResponse;
    let dbUser: UserEntity;

    try {
      response = await this.authService.validateCode(token);
      authData = authResponse42.parse(response.data);
      this.logger.log(`Sucessful call.`);
    } catch (e) {
      this.logger.error(`Couldn't call Intra API. [error=${e}]`);
      throw new UnauthorizedException('User auth failed');
    }

    try {
      response = await this.authService.fetchIntraUser(authData.access_token);
      userData = user42Schema.parse(response.data);
      this.logger.log(`Sucessful call.`);
    } catch (e) {
      this.logger.error(`Couldn't call Intra API. [error=${e}]`);
      throw new UnauthorizedException('User auth failed');
    }

    try {
      dbUser = await this.userService.getUserByIntra({
        intra_login: userData.login,
      });
      this.logger.log(`GetUserByIntra sucessful call.`);
    } catch (e) {
      this.logger.warn(`User not found, creating. [intra=${userData.login}]`);
      const userDto: CreateUserDto = {
        nickname: userData.login,
        avatar: process.env.DEFAULT_AVATAR_URL
          ? process.env.DEFAULT_AVATAR_URL
          : '', // TODO: Make a wrapper later
        intra_login: userData.login,
      };

      dbUser = await this.userService.create(userDto);
    }

    return dbUser;
  }
}
