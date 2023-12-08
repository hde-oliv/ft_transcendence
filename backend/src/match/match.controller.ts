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

@Controller('match')
export class MatchController {
  constructor() { }

  @UseGuards(JwtAuthGuard)
  @Get()
  getMe(@Request() req) {
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(updateUserSchema))
  @Post()
  updateMe(@Request() req, @Body() updateMeDto: UpdateUserDto) {
  }
}
