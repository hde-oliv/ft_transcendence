import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { ZodValidationPipe } from 'src/zodPipe';
import { UpdateUserDto, updateUserSchema } from 'src/users/dto/update-user-dto';
import { MatchService } from './match.service';

@Controller('match')
export class MatchController {
  constructor(
    private readonly matchService: MatchService
  ) { }

  @UseGuards(JwtAuthGuard)
  @Get()
  getMe(@Request() req) {
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(updateUserSchema))
  @Post('/joinQueue')
  joinQueue(@Request() req) {
    return this.matchService.joinQueue(req.user);
  }
}
