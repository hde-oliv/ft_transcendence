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
import { SendMessageDto } from './dto/send-message-dto';

// NOTE: Chat only works in the /chat page
// TODO: Create a global websocket to handle user status later
// TODO: List of online users

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  transpors: ['websocket', 'webtransport'],
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect {
  @WebSocketServer()
  wss: Server;

  constructor(private chatService: ChatService) { }

  private readonly logger = new Logger(ChatGateway.name);

  private clients: ClientSocket[] = [];

  private mapClients = new Map<string, Socket>();

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
    this.mapClients.set(user.intra_login, socket);
    this.logger.log(`Client Connected: ${socket.id}`);
    this.logger.log(`All Clients: ${this.getClientList()} `);
  }

  @SubscribeMessage('send_message')
  async handleNewMessage(
    @MessageBody() data: SendMessageDto,
    @ConnectedSocket() socket: Socket,
  ) {
    const user: Users = await this.chatService.getUserFromSocket(socket);
    const channel = await this.chatService.getChannelByName(data.channel_name);

    const members = await this.chatService.getValidMembershipsFromChannel(
      channel?.id,
    );

    const message = await this.chatService.registerNewMessage(
      { channel_id: channel.id, message: data.message },
      user,
    );

    const onlineUsers = this.getOnlineSocketsByMemberships(members);

    await this.broadcast(socket, onlineUsers, 'receive_message', message);
    // this.wss.sockets.emit('receive_message', data);
  }

  async broadcast(
    sender: Socket,
    targets: Socket[],
    event: string,
    message: any,
  ) {
    for (let i = 0; i < targets.length; i++) {
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
    this.logger.warn(`Memberships: ${JSON.stringify(memberships)}`);

    const onlineUsers = memberships.filter((m) => {
      const client = this.clients.find((c) => c.user.id === m.userId);
      return client !== undefined;
    });

    this.logger.warn(`Online Users: ${JSON.stringify(onlineUsers)}`);

    // map users to socket using lodash
    const onlineSockets = map(onlineUsers, (m) => {
      const client = this.clients.find((c) => c.user.id === m.userId);
      return client?.socket;
    });

    // remove undefined values
    const onlineSocketsWithoutUndefined = without(onlineSockets, undefined);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return onlineSocketsWithoutUndefined;
  }
}

export interface ClientSocket {
  user: Users;
  socket: Socket;
}
