import { UniqueTokenStrategy } from 'passport-unique-token';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserRepository } from 'src/user/user.repository';
import { authResponse42, user42Data, user42Schema } from './auth.model';
import { AxiosResponse } from 'axios';

@Injectable()
export class TokenStrategy extends PassportStrategy(
  UniqueTokenStrategy,
  'local',
) {
  constructor(
    private authService: AuthService,
    private userRepository: UserRepository,
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
    let dbUser: any; // TODO: Include type here

    try {
      response = await this.authService.validateCode(token);
      authData = authResponse42.parse(response.data);
    } catch (e) {
      this.logger.error(`Couldn't call Intra API. [error=${e}]`);
      throw new UnauthorizedException('User auth failed');
    }
    this.logger.log(`Sucessful call.`);

    try {
      response = await this.authService.fetchIntraUser(authData.access_token);
      userData = user42Schema.parse(response.data);
    } catch (e) {
      this.logger.error(`Couldn't call Intra API. [error=${e}]`);
      throw new UnauthorizedException('User auth failed');
    }
    this.logger.log(`Sucessful call.`);

    try {
      dbUser = await this.userRepository.getUserByIntra(userData.login);
    } catch (e) {}
    return userData;
  }
}
