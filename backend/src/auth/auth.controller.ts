import { Controller, Request, Post, UseGuards } from '@nestjs/common';
import { TokenAuthGuard } from './token.guard';
import { AuthService } from './auth.service';
import { user42Schema } from './auth.model';
// import { JwtAuthGuard } from './jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(TokenAuthGuard)
  @Post('login')
  async login(@Request() req) {
    const result = user42Schema.safeParse(req.user);
    if (!result.success) {
      // TODO: Raise 500 exception here
      return result.error;
    } else {
      return this.authService.login(result.data);
    }
  }

  // @UseGuards(JwtAuthGuard)
  // @Get('profile')
  // getProfile(@Request() req) {
  //   return req.user;
  // }
}
