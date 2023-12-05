import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user-dto';
import { UpdateOTPUserDto } from './dto/update-otp-user-dto';
import { returnUserSchema } from './dto/return-user-dto';
import { TokenClaims } from 'src/auth/auth.model';

@Injectable()
export class UsersService {
  constructor(private userRepository: UsersRepository) { }

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

  async getAllUsers() {
    return (await this.userRepository.getAllUsers()).map(e => returnUserSchema.parse(e));
  }

  create(user: CreateUserDto) {
    return this.userRepository.createUser(user);
  }

  async updateUserOnline(user: TokenClaims, online: boolean) {
    return this.userRepository.updateUserOnline(user.intra_login, online);
  }
}
