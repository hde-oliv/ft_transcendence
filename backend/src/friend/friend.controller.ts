import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { FriendService } from './friend.service';
import { CreateFriendshipDto } from './dto/create-friendship-dto';

@Controller('friend')
export class FriendController {
  constructor(private friendService: FriendService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllFriendships() {
    return await this.friendService.getAllFriendships();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':/id')
  async getFriendship(@Param() param: { id: string }) {
    return await this.friendService.getFriendshipById(param.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/user/:id')
  async getFriendshipsByUser(@Param() param: { id: string }) {
    return await this.friendService.getFriendshipsByUser(param.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createFriendship(
    @Request() req,
    @Body() new_friendship: CreateFriendshipDto,
  ) {
    return await this.friendService.createFriendship(req.user, new_friendship);
  }
}
