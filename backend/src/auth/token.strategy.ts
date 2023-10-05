import { UniqueTokenStrategy } from 'passport-unique-token';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import axios, { AxiosRequestConfig } from 'axios';
import z from 'zod';

const authResponse42 = z.object({
	access_token: z.string(),
	token_type: z.string().startsWith('bearer').length(6),
	expires_in: z.number().int(),
	refresh_token: z.string(),
	scope: z.string().startsWith("public").length(6),
	created_at: z.number().int(),
	secret_valid_until: z.number().int()
})

type authResponse42 = z.infer<typeof authResponse42>

@Injectable()
export class TokenStrategy extends PassportStrategy(
	UniqueTokenStrategy,
	'local',
) {
	constructor(private authService: AuthService) {
		super();
	}

	async validate(token: string): Promise<any> {
		let authData: authResponse42;
		let userData;
		const data = await this.authService.validateCode(token); //never throws
		try {
			authData = authResponse42.parse(data); //throws if null
		} catch (e) {
			// TODO: Make a finer error handling here in case of failing to call Intra API
			Logger.log(`User auth failed`);
			throw new UnauthorizedException('User auth failed');
		}
		try {
			userData = await this.fetchUserInformation(authData.access_token);
		} catch (e) {
			Logger.log(`User self data retrieval failed`);
			userData = null
			throw new UnauthorizedException('User self data retrieval failed');
		}
		return userData;
	}

	async fetchUserInformation(token: string): Promise<any> {
		const config: AxiosRequestConfig = {
			headers: {
				Authorization: `Bearer ${token}`
			}
		}
		const { data } = await axios.get('https://api.intra.42.fr/v2/me', config);

		return data;
	}
}
