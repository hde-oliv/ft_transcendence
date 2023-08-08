import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

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
