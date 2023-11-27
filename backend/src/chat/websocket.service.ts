import { Injectable } from '@nestjs/common';
import { WebSocketServer } from '@nestjs/websockets';
import { Users } from '@prisma/client';
import { Server, Socket } from 'socket.io';

@Injectable()
export class WebsocketService {
  @WebSocketServer() server: Server;

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
  removeUserFromRoom(userId: string, channelId: number) {
    const socs = this.userSockets(userId);
    const roomName = channelId.toString();
    socs.forEach(soc => {
      soc.leave(roomName);
    });
  }
}

interface ClientSocket {
  user: Users;
  socket: Socket;
}
