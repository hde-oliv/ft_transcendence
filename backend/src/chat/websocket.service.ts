import { Injectable, Logger } from '@nestjs/common';
import { WebSocketServer } from '@nestjs/websockets';
import { Users } from '@prisma/client';
import { Server, Socket } from 'socket.io';

@Injectable()
export class WebsocketService {
  constructor(
  ) { }
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(WebsocketService.name);

  clients: Array<ClientSocket> = [];
  /**
   * @param userId
   * @returns An array containing all user active conections to this application
   */
  private userSockets(userId: string): Socket[] {
    return this.clients.filter(e => e.user.intra_login === userId).map(e => e.socket);
  }

  emitToUser(userId: string, event: string, data: { [key: string]: any }) {
    this.server.to(userId).emit(event, data);
    // this.clients.filter(e => e.user.intra_login === userId).forEach(client => { client.socket.emit(event, data) })
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
  }
  /**
   *
   * @param userId
   * @param event
   * @param data
   *
   * @description Emit given event to all rooms the user is in, excepet self-room
   */
  emitToUsersRooms(userId: string, event: string, data: { [key: string]: any }) {
    try {
      const socs = this.userSockets(userId);
      let rooms: Set<string> = new Set();
      socs.forEach(soc => {
        soc.rooms.forEach(room => {
          if (room !== userId)
            rooms.add(room);
        })
      });
      const roomArr = Array.from(rooms);
      this.server.to(roomArr).emit(event, data);
    } catch (e) {
      this.logger.error(e);
    }
  }
}

type ClientSocket = {
  user: Users;
  socket: Socket;
}
