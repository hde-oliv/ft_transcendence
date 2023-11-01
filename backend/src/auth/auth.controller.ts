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
import {
  otpValidationSchema,
  OTPValidationDto,
} from './dto/otp-validation-dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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

  @UseGuards(JwtAuthGuard)
  @Post('otp/deactivate')
  @UsePipes(new ZodValidationPipe(otpTokenSchema))
  async deactivateOTP(@Request() req, @Body() otpTokenDto: OTPTokenDto) {
    return this.authService.deactivateOTP(
      req.user.intra_login,
      otpTokenDto.token,
    );
  }

  @Post('otp/validate')
  @UsePipes(new ZodValidationPipe(otpValidationSchema))
  async validateOTP(@Request() req, @Body() body: OTPValidationDto) {
    return this.authService.validateOTP(body.username, body.token);
  }
}
