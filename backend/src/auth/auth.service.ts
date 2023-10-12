import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios, { AxiosResponse } from 'axios';
import { Logger } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import { userLoginRet } from './auth.model';
import { randomBytes } from 'crypto';
import { encode } from 'hi-base32';
import * as OTPAuth from 'otpauth';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  private readonly logger = new Logger(AuthService.name);

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

  async generateRandomBase32() {
    const buffer = randomBytes(15);
    const base32 = encode(buffer).replace(/=/g, '').substring(0, 24);
    return base32;
  }

  async generateOTP() {
    const base32_secret = await this.generateRandomBase32();

    const totp = new OTPAuth.TOTP({
      issuer: 'transcendence.localhost',
      label: 'Transcendence',
      algorithm: 'SHA1',
      digits: 6,
      secret: base32_secret,
    });

    const otpauth_url = totp.toString();

    // TODO: Update User entity with the OTP info here
    // data: {
    //   otp_auth_url: otpauth_url,
    //   otp_base32: base32_secret,
    // },
    //

    return {
      base32: base32_secret,
      otp_url: otpauth_url,
    };
  }

  async verifyOTP(token: string, secret: string) {
    // TODO: Get user secret to validate
    const userSecret = secret;

    const totp = new OTPAuth.TOTP({
      issuer: 'transcendence.localhost',
      label: 'Transcendence',
      algorithm: 'SHA1',
      digits: 6,
      secret: userSecret,
    });

    const delta = totp.validate({ token });

    if (delta === null) {
      throw null; // TODO: Workaround, change later
    }

    // TODO: Update user otp_enabled & otp_verfified

    return { ok: 'OK' }; // TODO: Return something
  }

  async validateOTP(token: string, secret: string) {
    // TODO: Get user secret to validate
    const userSecret = secret;

    const totp = new OTPAuth.TOTP({
      issuer: 'transcendence.localhost',
      label: 'Transcendence',
      algorithm: 'SHA1',
      digits: 6,
      secret: userSecret,
    });

    let delta = totp.validate({ token, window: 1 });

    if (delta === null) {
      throw null;
    }

    return { ok: 'OK' };
  }

  // TODO: Function to disable OTP for user
}
