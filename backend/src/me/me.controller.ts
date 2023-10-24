import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { MeService } from './me.service';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { ZodValidationPipe } from 'src/zodPipe';
import { UpdateUserDto, updateUserSchema } from 'src/users/dto/update-user-dto';

@Controller('me')
export class MeController {
  constructor(private meService: MeService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getMe(@Request() req) {
    const intra_tag: string = req.user.intra_login;

    return this.meService.getMe(intra_tag);
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(updateUserSchema))
  @Post()
  updateMe(@Request() req, @Body() updateMeDto: UpdateUserDto) {
    const intra_tag: string = req.user.intra_login;

    return this.meService.updateMe(intra_tag, updateMeDto);
  }
}
