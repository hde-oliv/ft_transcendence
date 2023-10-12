import { Controller, Get, Param, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';

@Controller('/user')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  getUsers() {
    return this.usersService.getAllUsers();
  }

  @Get('/:id')
  getUser(@Param() param: { id: number }) {
    return this.usersService.getUser(param);
  }
}
