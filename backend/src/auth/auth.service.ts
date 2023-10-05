import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios, { AxiosResponse } from 'axios';
import { Logger } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import { userLoginRet } from './auth.model';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  private readonly logger = new Logger(AuthService.name);

  // Throws
  async validateCode(code: string): Promise<AxiosResponse> {
    this.logger.log(`Calling Intra API to get Bearer Token. [code=${code}]`);

    const response = await axios.post('https://api.intra.42.fr/oauth/token', {
      grant_type: 'authorization_code',
      client_id: process.env.FT_CLIENT_ID,
      client_secret: process.env.FT_CLIENT_SECRET,
      code: code,
      redirect_uri: process.env.FT_REDIRECT_URI,
    });

    return response;
  }

  // Throws
  async fetchIntraUser(token: string): Promise<AxiosResponse> {
    this.logger.log(`Calling Intra API to get user info.`);

    const config: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.get('https://api.intra.42.fr/v2/me', config);

    return response;
  }

  async login(user: userLoginRet) {
    const payload = { ...user };

    this.logger.log(payload, `Creating Bearer token.`);

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
