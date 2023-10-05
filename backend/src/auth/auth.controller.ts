import { Controller, Request, Post, UseGuards, Get } from '@nestjs/common';
import { TokenAuthGuard } from './token.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';
import z from 'zod';

const userReturnInfo = z.object({
	id: z.number(),
	email: z.string().email(),
	login: z.string(),
	first_name: z.string()
})

type userLoginRet = z.infer<typeof userReturnInfo>;
/**
	"id": 86714,
	"email": "hde-camp@student.42sp.org.br",
	"login": "hde-camp",
	"first_name": "Henrique",
 */
@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) { }

	@UseGuards(TokenAuthGuard)
	@Post('login')
	async login(@Request() req) {
		this.authService.login(req.user);
		return userReturnInfo.safeParse(req.user);
	}

	@UseGuards(JwtAuthGuard)
	@Get('profile')
	getProfile(@Request() req) {
		return req.user;
	}
}
