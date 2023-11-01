import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios, { AxiosResponse } from 'axios';
import { Logger } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import { TokenClaims, tokenClaimsSchema, userLoginRet } from './auth.model';
import { randomBytes } from 'crypto';
import { encode } from 'hi-base32';
import * as OTPAuth from 'otpauth';
import { UpdateOTPUserDto } from 'src/users/dto/update-otp-user-dto';
import { UsersService } from 'src/users/users.service';
import { jwtConstants } from './auth.constants';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UsersService,
  ) {}

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
    this.logger.log(JSON.stringify(payload), `Creating Bearer token.`);
    return {
      access_token: payload.otp_enabled
        ? payload.intra_login
        : this.jwtService.sign(payload),
    };
  }

  async decodeToken(token: string) {
    const payload = this.jwtService.verify(token, {
      secret: jwtConstants.secret,
    });

    return payload;
  }

  // Throws
  async generateOTP(intra_login: string) {
    const buffer = randomBytes(15);
    const base32_secret = encode(buffer).replace(/=/g, '').substring(0, 24);

    const totp = new OTPAuth.TOTP({
      issuer: 'transcendence.localhost',
      label: 'Transcendence',
      algorithm: 'SHA1',
      digits: 6,
      secret: base32_secret,
    });

    const otpauth_url = totp.toString();

    const updateDto: UpdateOTPUserDto = {
      intra_login,
      otp_auth_url: otpauth_url,
      otp_base32: base32_secret,
    };

    this.userService.updateOTP(updateDto);

    return updateDto;
  }

  async deactivateOTP(intra_login: string, token: string) {
    const user = await this.userService.getUserByIntra({ intra_login });
    const userSecret = user.otp_base32;

    if (userSecret === null) {
      throw new UnauthorizedException('OTP Token failed');
    }

    const totp = new OTPAuth.TOTP({
      issuer: 'transcendence.localhost',
      label: 'Transcendence',
      algorithm: 'SHA1',
      digits: 6,
      secret: userSecret,
    });

    const delta = totp.validate({ token });

    if (delta === null) {
      throw new UnauthorizedException('OTP Token failed');
    }

    // TODO: Update user otp_enabled & otp_verfified
    const updateDto: UpdateOTPUserDto = {
      intra_login,
      otp_enabled: false,
      otp_verified: false,
    };

    this.userService.updateOTP(updateDto);

    return { status: 'OK' }; // TODO: Return something
  }

  async verifyOTP(intra_login: string, token: string) {
    const user = await this.userService.getUserByIntra({ intra_login });
    const userSecret = user.otp_base32;

    if (userSecret === null) {
      throw new UnauthorizedException('OTP Token failed');
    }

    const totp = new OTPAuth.TOTP({
      issuer: 'transcendence.localhost',
      label: 'Transcendence',
      algorithm: 'SHA1',
      digits: 6,
      secret: userSecret,
    });

    const delta = totp.validate({ token });

    if (delta === null) {
      throw new UnauthorizedException('OTP Token failed');
    }

    // TODO: Update user otp_enabled & otp_verfified
    const updateDto: UpdateOTPUserDto = {
      intra_login,
      otp_enabled: true,
      otp_verified: true,
    };

    this.userService.updateOTP(updateDto);

    return { status: 'OK' }; // TODO: Return something
  }

  async validateOTP(intra_login: string, token: string) {
    /*
    dbUser = await this.userService.getUserByIntra({
        intra_login: userData.login,
      });
      this.logger.log(`GetUserByIntra sucessful call.`);

       try {
      tokenClaims = tokenClaimsSchema.parse(dbUser);
    } catch (e) {
      this.logger.warn(`Invalid user, couldn't parse.`);
      throw new UnauthorizedException('User auth failed');
    }

    return tokenClaims;
     */
    let tokenClaims: TokenClaims;

    const user = await this.userService.getUserByIntra({ intra_login });
    const userSecret = user.otp_base32;
    //this.authService.login(req.user)
    if (userSecret === null) {
      throw new UnauthorizedException('OTP Token failed');
    }

    const totp = new OTPAuth.TOTP({
      issuer: 'transcendence.localhost',
      label: 'Transcendence',
      algorithm: 'SHA1',
      digits: 6,
      secret: userSecret,
    });

    let delta = totp.validate({ token, window: 1 });

    if (delta === null) {
      throw new UnauthorizedException('OTP Token failed');
    }
    try {
      tokenClaims = tokenClaimsSchema.parse(user);
    } catch (e) {
      throw new UnauthorizedException('OTP Token failed');
    }

    return { access_token: this.jwtService.sign(tokenClaims) }; // TODO: Make a better return
  }

  // TODO: Function to disable OTP for user
}
