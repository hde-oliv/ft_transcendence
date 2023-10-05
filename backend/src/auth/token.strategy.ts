import { UniqueTokenStrategy } from 'passport-unique-token';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserRepository } from 'src/user/user.repository';
import axios, { AxiosRequestConfig } from 'axios';
import z from 'zod';

const authResponse42 = z.object({
  access_token: z.string(),
  token_type: z.string().startsWith('bearer').length(6),
  expires_in: z.number().int(),
  refresh_token: z.string(),
  scope: z.string().startsWith('public').length(6),
  created_at: z.number().int(),
  secret_valid_until: z.number().int(),
});

const user42Schema = z.object({
  id: z.number(),
  email: z.string(),
  login: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  usual_full_name: z.string(),
  usual_first_name: z.nullable(z.string()),
  url: z.string(),
  phone: z.string(),
  displayname: z.string(),
  kind: z.string(),
});

type authResponse42 = z.infer<typeof authResponse42>;
type user42Data = z.infer<typeof user42Schema>;

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

  async validate(token: string): Promise<any> {
    console.log('validate_passport');
    let authData: authResponse42;
    let user42Data: user42Data;
    let dbUser;
    const data = await this.authService.validateCode(token); // NOTE: never throws
    try {
      authData = authResponse42.parse(data); // NOTE: throws if null
    } catch (e) {
      // TODO: Make a finer error handling here in case of failing to call Intra API
      Logger.log(`User auth failed`);
      throw new UnauthorizedException('User auth failed');
    }
    try {
      user42Data = await this.fetchIntraUser(authData.access_token);
    } catch (e) {
      Logger.log(`User self data retrieval failed`);
      throw new UnauthorizedException('User self data retrieval failed');
    }
    try {
      dbUser = await this.userRepository.getUserByIntra(user42Data.login);
    } catch (e) {}
    return user42Data;
  }

  async fetchIntraUser(token: string): Promise<user42Data> {
    const config: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const { data } = await axios.get('https://api.intra.42.fr/v2/me', config);
    const userData = user42Schema.parse(data);
    return data;
  }
}
