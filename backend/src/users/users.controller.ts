import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user-dto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';

@Controller('/user')
export class UsersController {
  constructor(private usersService: UsersService) { }

  @UseGuards(JwtAuthGuard)
  @Get()
  getUsers() {
    return this.usersService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:intra_login')
  getUserByIntra(@Param() param: { intra_login: string }) {
    return this.usersService.getUserByIntra(param);
  }

  @Post()
  createUser(@Body() new_user: CreateUserDto) {
    return this.usersService.create(new_user);
  }
}
