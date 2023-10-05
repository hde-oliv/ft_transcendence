import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { Logger } from '@nestjs/common';
import z from 'zod';


@Injectable()
export class AuthService {
	constructor(private jwtService: JwtService) { }

	async validateCode(code: string): Promise<any> {
		let response42;
		try {
			const response = await axios.post('https://api.intra.42.fr/oauth/token', {
				"grant_type": "authorization_code",
				"client_id": "u-s4t2ud-fb85b86a0af8ab2f7f127ad1616f6d3125fd4f84c7e8e5a679b9fe5a51821265",
				"client_secret": "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",
				"code": code,
				"redirect_uri": "http://localhost:3001"
			})
			response42 = response.data;
		} catch (e) {
			Logger.log(e);
			response42 = null
		}
		return response42;
	}

	async login(user: any) {
		const payload = { username: user.username, sub: user.userId };
		return {
			access_token: this.jwtService.sign(payload),
		};
	}
}
