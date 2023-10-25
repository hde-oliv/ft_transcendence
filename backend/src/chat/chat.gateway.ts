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

  async afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Initialized');
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client Disconnected: ${client.id}`);
  }

  async handleConnection(client: Socket) {
    this.logger.log(`Client Connected: ${client.id}`);
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
