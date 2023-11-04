import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UsersRepository } from 'src/users/users.repository';
import { UnauthorizedException } from '@nestjs/common';
import { UpdateUserDto } from 'src/users/dto/update-user-dto';
import { returnMeSchema } from './dto/return-me-dto';

@Injectable()
export class MeService {
  constructor(private userRepository: UsersRepository) {}

  // throws
  async getMe(intra_tag: string) {
    const me = await this.userRepository.getUserByIntra(intra_tag);
    try {
      return returnMeSchema.parse(me);
    } catch {
      throw new InternalServerErrorException();
    }
  }

  // throws
  async updateMe(intra_tag: string, updateDto: UpdateUserDto) {
    if (intra_tag !== updateDto.intra_login) {
      throw new UnauthorizedException('Trying to update another user.');
    } else {
      const me = await this.userRepository.updateUser(updateDto);

      try {
        return returnMeSchema.parse(me);
      } catch {
        throw new InternalServerErrorException();
      }
    }
  }
}
