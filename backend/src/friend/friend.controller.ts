import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Request,
  InternalServerErrorException,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { FriendService } from './friend.service';
import { CreateFriendshipDto } from './dto/create-friendship-dto';
import userFromReq from 'utils/userFromReq';

@Controller('friend')
export class FriendController {
  constructor(private friendService: FriendService) { }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllFriendships(@Request() req) {
    const user = userFromReq(req);
    return await this.friendService.getAllFriendships(user.intra_login);
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
    @Res() response
  ) {
    const result = await this.friendService.createFriendship(req.user, new_friendship);
    if (result === null)
      throw new InternalServerErrorException();
    if (result.new)
      return response.status(HttpStatus.CREATED).json(result.friendship);
    else
      return response.status(HttpStatus.OK).json(result.friendship);
  }
}
