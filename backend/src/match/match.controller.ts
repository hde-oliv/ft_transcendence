import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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
  @Post('/joinQueue')
  joinQueue(@Request() req) {
    return this.matchService.joinQueue(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(updateUserSchema))
  @Delete('/leaveQueue')
  leaveQueue(@Request() req) {
    return this.matchService.leaveQueue(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(updateUserSchema))
  @Patch('/accept')
  acceptMatch(@Request() req) {
    this.matchService.acceptQueueInvite(req.user);
    return {};
  }

  @UseGuards(JwtAuthGuard)
  @Post('/invite/:targetId')
  inviteIntra(@Request() req, @Param('targetId') targetId: string) {
    return this.matchService.createInvite(req.user, targetId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/P2P/:inviteId')
  acceptInvite(@Request() req, @Param('inviteId') inviteId: string) {
    return this.matchService.acceptP2P(req.user.intra_login, inviteId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/history/:userId')
  history(@Request() req, @Param('userId') userId: string) {
    return this.matchService.getUserHistory(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/history')
  myHistory(@Request() req, @Param('userId') userId: string) {
    return this.matchService.getUserHistory(req.user.intra_login);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/myStats')
  stats(@Request() req) {
    return this.matchService.getUserStats(req.user.intra_login);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/stats/:userId')
  userStats(@Request() req, @Param('userId') userId: string) {
    return this.matchService.getUserStats(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/myRank')
  rank(@Request() req) {
    return this.matchService.getUserRank(req.user.intra_login);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/rank/:userId')
  userRank(@Request() req, @Param('userId') userId: string) {
    return this.matchService.getUserRank(userId);
  }
}
