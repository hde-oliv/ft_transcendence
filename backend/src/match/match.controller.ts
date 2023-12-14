import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { ZodValidationPipe } from 'src/zodPipe';
import { UpdateUserDto, updateUserSchema } from 'src/users/dto/update-user-dto';
import { MatchService } from './match.service';
import { createInviteSchema } from './dto/create-invite-dto';


@Controller('match')
export class MatchController {
  constructor(
    private readonly matchService: MatchService
  ) { 
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getMe(@Request() req) {
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(updateUserSchema))
  @Post()
  updateMe(@Request() req, @Body() updateMeDto: UpdateUserDto) {
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(createInviteSchema))
  @Post('/invite/:targetId')
  inviteIntra(@Request() req, @Param('targetId') targetId: string) {
    return this.matchService.createInvite(req.user.intra_login, targetId);
  }

}
