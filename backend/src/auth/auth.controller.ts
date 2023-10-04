import { Controller, Request, Post, UseGuards, Get } from '@nestjs/common';
import { TokenAuthGuard } from './token.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(TokenAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
