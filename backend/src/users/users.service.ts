import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user-dto';
import { UpdateOTPUserDto } from './dto/update-otp-user-dto';

@Injectable()
export class UsersService {
  constructor(private userRepository: UsersRepository) {}

  getUser(param: { id: string }) {
    return this.userRepository.getUserById(param.id);
  }

  // Throws
  updateOTP(user: UpdateOTPUserDto) {
    return this.userRepository.updateOTP(user);
  }

  // Throws
  getUserByIntra(param: { intra_login: string }) {
    return this.userRepository.getUserByIntra(param.intra_login);
  }

  getAllUsers() {
    return this.userRepository.getAllUsers();
  }

  create(user: CreateUserDto) {
    return this.userRepository.createUser(user);
  }
}
