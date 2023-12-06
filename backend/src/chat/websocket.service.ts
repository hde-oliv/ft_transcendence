import { Injectable, Logger } from '@nestjs/common';
import { WebSocketServer } from '@nestjs/websockets';
import { Users } from '@prisma/client';
import { privateDecrypt } from 'crypto';
import { Server, Socket } from 'socket.io';

@Injectable()
export class WebsocketService {
  constructor() { }
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(WebsocketService.name);

  clients: ClientSocket[] = [];
  /**
   * @param userId
   * @returns An array containing all user active conections to this application
   */
  private userSockets(userId: string): Socket[] {
    return this.clients.filter(e => e.user.intra_login === userId).map(e => e.socket);
  }

  emitToUser(userId: string, event: string, data: { [key: string]: any }) {
    this.clients.filter(e => e.user.intra_login === userId).forEach(client => { client.socket.emit(event, data) })
  }
  removeUserFromRoom(userId: string, channelId: string) {
    const socs = this.userSockets(userId);
    socs.forEach(soc => {
      soc.leave(channelId);
    });
  }
  addUserToRoom(userId: string, channelId: string) {
    const socs = this.userSockets(userId);
    socs.forEach(soc => soc.join(channelId));
  }
  emitToRoom(room: string, event: string, data: { [key: string]: any }) {
    this.server.to(room).emit(event, data);
    // const result = this.server.to(room).emit(event, data);
    // this.logger.log(`Emiting ${event} to room [${room}] result: [${result}]`);
  }
}

interface ClientSocket {
  user: Users;
  socket: Socket;
}
