import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Injectable, Logger, UseFilters } from '@nestjs/common';
import { Channels, Memberships, Users } from '@prisma/client';
import { map, without } from 'lodash';
import { SendMessageDto } from './dto/send-message-dto';
import { ChatFilter } from './chat.filter';
import { WebsocketService } from './websocket.service';
import { UsersService } from 'src/users/users.service';

// NOTE: Chat only works in the /chat page
// TODO: Create a global websocket to handle user status later
// TODO: List of online users

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  transpors: ['websocket', 'webtransport'],
})
export class SocketGateway
  implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private chatService: ChatService,
    private socketService: WebsocketService,
    private userServive: UsersService
  ) { }

  private readonly logger = new Logger(SocketGateway.name);

  private clients: ClientSocket[] = [];

  @UseFilters(new ChatFilter())
  async afterInit(server: Server) {
    this.socketService.server = server;
    this.logger.log('WebSocket Gateway Initialized');
  }

  @UseFilters(new ChatFilter())
  async handleDisconnect(socket: Socket) {
    try {
      const user = await this.chatService.getUserFromSocket(socket);
      try {
        const newClients = this.clients.filter(
          (cl: ClientSocket) => cl.socket.id !== socket.id,
        );

        this.clients = newClients;
        this.socketService.clients = newClients;
        const rooms = socket.rooms;
        const updater = this.userServive.updateUserOnline(user, false);
        rooms.forEach((room) => {
          socket.leave(room);
        });
        this.logger.log(`Client Disconnected: ${socket.id}`);
        this.logger.log(`All Clients: ${this.getClientList()} `);
        await updater;
      } catch (e) {
        this.logger.warn(`Could't perform operations on sokcet ${socket.id}`);
      }
    } catch (e) {
      this.logger.warn(`Could't get user data from socket ${socket.id} - disconnected`);
    }

  }

  @UseFilters(new ChatFilter())
  async handleConnection(socket: Socket) { //set user as online!
    try {
      const user = await this.chatService.getUserFromSocket(socket);
      try {
        const clientSocket = { user, socket };
        this.socketService.clients = [...this.clients, clientSocket];
        this.clients = [...this.clients, clientSocket];
        this.logger.log(`Client Connected: ${socket.id}`);
        const channels = (await this.chatService.getChannelsByUser(user)).map(
          (e) => {
            return e.channelId.toString();
          },
        );
        this.logger.warn(`channels:${channels}`)
        const updater = this.userServive.updateUserOnline(user, true);
        this.logger.warn(`aked for update`);
        for (let channel of channels) {
          socket.join(channel);
        }
        await updater;
        this.logger.warn(updater);
      } catch (e) {
        socket.rooms.forEach(e => {
          socket.leave(e);
        })
        socket.disconnect();
        if (e instanceof WsException)
          this.logger.warn(e.message)
      }
    } catch (e) {
      this.logger.warn(`Could't get user data from socket ${socket.id} - will be disconnected`)
      socket.disconnect();
    }
  }

  @UseFilters(new ChatFilter())
  @SubscribeMessage('channel_message')
  async handleMessageEvent(
    @MessageBody() data: { message: string; channelId: number },
    @ConnectedSocket() socket: Socket,
  ) {
    const user: Users = await this.chatService.getUserFromSocket(socket); //TODO: messages must be sanitized before included!
    const channel = await this.chatService.getChannel(data.channelId);
    const message = await this.chatService.registerNewMessage(
      {
        channel_id: data.channelId,
        message: data.message,
      },
      user,
    );
    socket.to(channel.id.toString()).emit('server_message', message);
    socket.emit('server_message', message);
    return message;
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
