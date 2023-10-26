import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Logger } from '@nestjs/common';
import { Users } from '@prisma/client';
import { map, without } from 'lodash';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  transpors: ['websocket', 'webtransport'],
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect
{
  @WebSocketServer()
  wss: Server;

  constructor(private chatService: ChatService) {}

  private readonly logger = new Logger(ChatGateway.name);

  private clients: ClientSocket[] = [];

  getClientList() {
    let ret: string = '';
    for (let i = 0; i < this.clients.length; i++) {
      ret += `{${this.clients[i].socket.id}, ${this.clients[i].user.intra_login}}; `;
    }
    return ret;
  }

  async afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Initialized');
  }

  async handleDisconnect(socket: Socket) {
    const user = await this.chatService.getUserFromSocket(socket);

    // NOTE: remove disconnected user
    let newClients = map(this.clients, function (cl: ClientSocket) {
      if (cl.socket.id !== socket.id) return cl;
    });

    newClients = without(newClients, undefined);

    // @ts-ignore
    this.clients = newClients;

    this.logger.log(`Client Disconnected: ${socket.id}`);
    this.logger.log(`All Clients: ${this.getClientList()} `);
  }

  async handleConnection(socket: Socket) {
    const user = await this.chatService.getUserFromSocket(socket);
    const clientSocket = { user, socket };

    this.clients = [...this.clients, clientSocket];

    this.logger.log(`Client Connected: ${socket.id}`);
    this.logger.log(`All Clients: ${this.getClientList()} `);
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody() data: string,
    @ConnectedSocket() socket: Socket,
  ) {
    const user = await this.chatService.getUserFromSocket(socket);

    this.logger.log(user);

    this.wss.sockets.emit('receive_message', data);
  }
}

export interface ClientSocket {
  user: Users;
  socket: Socket;
}
