import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UsersRepository } from 'src/users/users.repository';
import { UnauthorizedException } from '@nestjs/common';
import { UpdateUserDto } from 'src/users/dto/update-user-dto';
import { returnMeSchema } from 'src/chat/dto/return-me-dto';

@Injectable()
export class MeService {
  constructor(private userRepository: UsersRepository) {}

  // throws
  getMe(intra_tag: string) {
    const me = this.userRepository.getUserByIntra(intra_tag);
    try {
      return returnMeSchema.parse(me);
    } catch {
      throw new InternalServerErrorException();
    }
  }

  // throws
  updateMe(intra_tag: string, updateDto: UpdateUserDto) {
    if (intra_tag !== updateDto.intra_login) {
      throw new UnauthorizedException('Trying to update another user.');
    } else {
      const me = this.userRepository.updateUser(updateDto);

      try {
        return returnMeSchema.parse(me);
      } catch {
        throw new InternalServerErrorException();
      }
    }
  }
}
