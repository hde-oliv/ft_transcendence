import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UsersRepository } from 'src/users/users.repository';
import { ForbiddenException } from '@nestjs/common';
import { UpdateUserDto } from 'src/users/dto/update-user-dto';
import { returnMeSchema } from './dto/return-me-dto';
import { WebsocketService } from 'src/chat/websocket.service';

@Injectable()
export class MeService {
  constructor(
    private userRepository: UsersRepository,
    private websocketService: WebsocketService
  ) { }

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
      throw new ForbiddenException('Trying to update another user.');
    } else {
      const me = await this.userRepository.updateUser(updateDto);
      try {
        let parsedMeSchema = await returnMeSchema.parse(me);
        this.websocketService.emitToUsersRooms(updateDto.intra_login, 'updateUser', parsedMeSchema)
        return parsedMeSchema
      } catch {
        throw new InternalServerErrorException();
      }
    }
  }
}
