import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private userRepository: UsersRepository) {}

  getUser(param: { id: number }) {
    return this.userRepository.getUserById(param.id);
  }

  getAllUsers() {
    return this.userRepository.getAllUsers();
  }

  createRandom() {
    return this.userRepository.createRandomUser();
  }

  create(req: Request) {
    return this.userRepository.createUser(req.body);
  }
}
