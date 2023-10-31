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
import { NewMessageDto } from './dto/new-message-dto';

// NOTE: Chat only works in the /chat page
// TODO: Define how a chat is created

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
    // Send to frontend all messages
    this.logger.log('WebSocket Gateway Initialized');
  }

  async handleDisconnect(socket: Socket) {
    // const user = await this.chatService.getUserFromSocket(socket);

    // let newClients = map(this.clients, function (cl: ClientSocket) {
    //   if (cl.socket.id !== socket.id) return cl;
    // });

    // newClients = without(newClients, undefined);
    // // @ts-ignore
    // this.clients = newClients;

    this.logger.log(`Client Disconnected: ${socket.id}`);
    this.logger.log(`All Clients: ${this.getClientList()} `);
  }

  async handleConnection(socket: Socket) {
    // const user = await this.chatService.getUserFromSocket(socket);
    // const clientSocket = { user, socket };

    // this.clients = [...this.clients, clientSocket];

    this.logger.log(`Client Connected: ${socket.id}`);
    this.logger.log(`All Clients: ${this.getClientList()} `);
  }

  @SubscribeMessage('NewMessage')
  async handleNewMessage(
    @MessageBody() data: NewMessageDto,
    @ConnectedSocket() socket: Socket,
  ) {
    // const user: Users = await this.chatService.getUserFromSocket(socket);
    // const channel = await this.chatService.getChannel(data.channel_id);
    // await this.chatService.registerNewMessage(data, user);
    // const onlineUsers = getOnlineSocketsByChannel(channel);
    // await this.broadcast(onlineUsers, 'ReceiveMessage', data.message);
    // this.wss.sockets.emit('receive_message', data);
  }

  async broadcast(targets: Socket[], event: string, message: any) {
    for (let i = 0; i < targets.length; i++) {
      targets[i].emit(event, message);
    }
  }

  getClientList() {
    let ret: string = '';
    for (let i = 0; i < this.clients.length; i++) {
      ret += `{${this.clients[i].socket.id}, ${this.clients[i].user.intra_login}}; `;
    }
    return ret;
  }
}

export interface ClientSocket {
  user: Users;
  socket: Socket;
}
