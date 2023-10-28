import {
  Controller,
  Request,
  Post,
  UseGuards,
  Get,
  UsePipes,
  Body,
} from '@nestjs/common';
import { TokenAuthGuard } from './token.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';
import { ZodValidationPipe } from 'src/zodPipe';
import { otpTokenSchema, OTPTokenDto } from './dto/otp-token-dto';
import { otpValidationPayload } from './otpValidade/otp-validation-dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @UseGuards(TokenAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('decode')
  async getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('otp/generate')
  async generateOTP(@Request() req) {
    return this.authService.generateOTP(req.user.intra_login);
  }

  @UseGuards(JwtAuthGuard)
  @Post('otp/verify')
  @UsePipes(new ZodValidationPipe(otpTokenSchema))
  async verifyOTP(@Request() req, @Body() otpTokenDto: OTPTokenDto) {
    return this.authService.verifyOTP(req.user.intra_login, otpTokenDto.token);
  }

  @Post('otp/validate')
  @UsePipes(new ZodValidationPipe(otpValidationPayload))
  async validateOTP(@Request() req, @Body() body: { token: string, username: string }) {
    return this.authService.validateOTP(
      body.username,
      body.token,
    );
  }
}
