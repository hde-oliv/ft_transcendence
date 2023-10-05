import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { Logger } from '@nestjs/common';
import { userLoginRet } from './auth.controller';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateCode(code: string): Promise<any> {
    let response42: any;

    try {
      const response = await axios.post('https://api.intra.42.fr/oauth/token', {
        grant_type: 'authorization_code',
        client_id: process.env.FT_CLIENT_ID,
        client_secret: process.env.FT_CLIENT_SECRET,
        code: code,
        redirect_uri: process.env.FT_REDIRECT_URI,
      });
      response42 = response.data;
    } catch (e) {
      Logger.error(e);
      response42 = null;
    }
    return response42;
  }

  async login(user: userLoginRet) {
    const payload = { login: user.login };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
