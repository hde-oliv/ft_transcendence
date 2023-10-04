import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { Logger } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateCode(code: string): Promise<any> {
    axios
      .post(
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
      )
      .then((data) => {
        Logger.log(data);
      })
      .catch((err) => {
        Logger.log(err);
      });
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
