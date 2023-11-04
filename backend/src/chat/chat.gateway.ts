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
import { Channels, Memberships, Users } from '@prisma/client';
import { map, without } from 'lodash';
import { NewMessageDto } from './dto/new-message-dto';

// NOTE: Chat only works in the /chat page
// TODO: Define how a chat is created
// TODO: Create a global websocket to handle user status later
// TODO: List of online users

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

  async afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Initialized');
  }

  async handleDisconnect(socket: Socket) {
    const user = await this.chatService.getUserFromSocket(socket);

    const newClients = this.clients.filter(
      (cl: ClientSocket) => cl.socket.id !== socket.id,
    );

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

  @SubscribeMessage('NewMessage')
  async handleNewMessage(
    @MessageBody() data: NewMessageDto,
    @ConnectedSocket() socket: Socket,
  ) {
    const user: Users = await this.chatService.getUserFromSocket(socket);
    const channel = await this.chatService.getChannel(data.channel_id);

    const members = await this.chatService.getValidMembershipsFromChannel(
      channel?.id,
    );

    await this.chatService.registerNewMessage(data, user);

    const onlineUsers = this.getOnlineSocketsByMemberships(members);

    await this.broadcast(socket, onlineUsers, 'ReceiveMessage', data.message);
    this.wss.sockets.emit('receive_message', data);
  }

  async broadcast(
    sender: Socket,
    targets: Socket[],
    event: string,
    message: any,
  ) {
    for (let i = 0; i < targets.length; i++) {
      if (targets[i].id === sender.id) continue;
      targets[i].emit(event, message);
    }
  }

  getClientList() {
    let ret = '';
    for (let i = 0; i < this.clients.length; i++) {
      ret += `{${this.clients[i].socket.id}, ${this.clients[i].user.intra_login}}; `;
    }
    return ret;
  }

  getOnlineSocketsByMemberships(memberships: Memberships[]): Socket[] {
    const onlineUsers = memberships.filter((m) => {
      const client = this.clients.find((c) => c.user.id === m.userId);
      return client !== undefined;
    });

    const onlineSockets = map(onlineUsers, (m) => {
      const client = this.clients.find((c) => c.user.id === m.userId);
      return client?.socket; // add null check here
    }).filter((socket) => socket !== undefined); // add filter to remove undefined values

    return onlineSockets as Socket[]; // cast the result to Socket[]
  }
}

export interface ClientSocket {
  user: Users;
  socket: Socket;
}
