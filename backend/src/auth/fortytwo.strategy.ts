import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(code: string): Promise<any> {
    const data = await this.authService.validateCode(code);

    // TODO: Make a finer error handling here in case of failing to call Intra API
    if (!data) {
      throw new UnauthorizedException();
    }



    return this.fetchUserInformation(data.access_token);
  }

  async fetchUserInformation(token: string): Promise<any> {
    const { data } = await axios.post(
      'https://api.intra.42.fr/oauth/token',
      {
        client_id:
          '4224de86af82d524e1bfe0ce1c081fd4889bed087514b62a3c59e72c0d0653d4',
        state: 'M8oi9O5PMKJENUfg5WPGoPvXm0qwSSeE',
        grant_type: 'authorization_code',
        client_secret:
          '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',
        code: code,
        redirect_uri: 'http://localhost:3000',
      },
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

  }
}
