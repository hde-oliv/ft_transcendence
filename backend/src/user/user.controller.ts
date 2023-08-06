import { Controller, Get, Delete, Param, Patch, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { UserService } from './user.service';

@Controller('/user')
export class UserController {
    constructor(private userService: UserService) {}

    @Get()
    getUsers() {
        return this.userService.getAllUsers();
    }

    @Get("/:id")
    getUser(@Param() param: { id: number }) {
        return this.userService.getUser(param);
    }

    @Post("/random")
    createRandom() {
        return this.userService.createRandom();
    }

    @Post()
    create(@Req() req: Request) {
        return this.userService.create(req);
    }
};
