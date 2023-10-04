import { UniqueTokenStrategy } from 'passport-unique-token';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import axios from 'axios';

@Injectable()
export class TokenStrategy extends PassportStrategy(
  UniqueTokenStrategy,
  'local',
) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(token: string): Promise<any> {
    const data = await this.authService.validateCode(token);

    // TODO: Make a finer error handling here in case of failing to call Intra API
    if (!data) {
      throw new UnauthorizedException();
    }

    return this.fetchUserInformation(data.access_token);
  }

  async fetchUserInformation(token: string): Promise<any> {
    const { data } = await axios.post('https://api.intra.42.fr/v2/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return data;
  }
}
