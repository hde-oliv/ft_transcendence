import { Injectable } from '@nestjs/common';
import { UsersRepository } from 'src/users/users.repository';
import { UnauthorizedException } from '@nestjs/common';
import { UpdateUserDto } from 'src/users/dto/update-user-dto';

@Injectable()
export class MeService {
  constructor(private userRepository: UsersRepository) {}

  // throws
  getMe(intra_tag: string) {
    return this.userRepository.getUserByIntra(intra_tag);
  }

  updateMe(intra_tag: string, updateDto: UpdateUserDto) {
    if (intra_tag !== updateDto.intra_login) {
      throw new UnauthorizedException('Trying to update another user.');
    } else {
      return this.userRepository.updateUser(updateDto);
    }
  }
}
