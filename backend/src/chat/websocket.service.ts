import { Injectable } from '@nestjs/common';
import { WebSocketServer } from '@nestjs/websockets';
import { Users } from '@prisma/client';
import { Server, Socket } from 'socket.io';

@Injectable()
export class WebsocketService {
  @WebSocketServer() server: Server;

  clients: ClientSocket[] = [];

  emitToUser(userId: string, event: string, data: { [key: string]: any }) {
    this.clients.filter(e => e.user.intra_login === userId).forEach(client => { client.socket.emit(event, data) })
  }
}

interface ClientSocket {
  user: Users;
  socket: Socket;
}
