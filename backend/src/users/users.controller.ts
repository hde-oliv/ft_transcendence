import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
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

  // @Get('/:id')
  // getUser(@Param() param: { id: number }) {
  //   return this.usersService.getUser(param);
  // }

  @UseGuards(JwtAuthGuard)
  @Get('/:intra')
  getUserByIntra(@Param() param: { intra_login: string }) {
    return this.usersService.getUserByIntra(param);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  createUser(@Body() new_user: CreateUserDto) {
    return this.usersService.create(new_user);
  }
}
