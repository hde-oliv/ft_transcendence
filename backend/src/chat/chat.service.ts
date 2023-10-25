import { Injectable, Logger } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class ChatService {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {}

  private readonly logger = new Logger(ChatService.name);

  async getUserFromSocket(socket: Socket) {
    let token = socket.handshake.headers.authorization
      ? socket.handshake.headers.authorization
      : '';

    this.logger.log(token);

    if (token === '') {
      throw new WsException('Invalid credentials.');
    }

    token = token.split(' ')[1]; // NOTE: To remove 'Bearer'

    const payload = await this.authService.decodeToken(token);

    this.logger.log(payload);

    if (!payload) {
      throw new WsException('Invalid credentials.');
    }

    let user;

    try {
      user = this.userService.getUserByIntra({
        intra_login: payload.intra_login,
      });
    } catch (e) {
      throw new WsException('Invalid credentials.');
    }

    return user;
  }
}
