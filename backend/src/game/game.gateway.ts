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
import { Logger } from '@nestjs/common';

@WebSocketGateway(9090, {
  cors: {
    origin: '*',
  },
  transpors: ['websocket', 'webtransport'],
})
export class GameGateway
  implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect
{
  @WebSocketServer()
  wss: Server;

  // constructor(private chatService: ChatService) {}

  private readonly logger = new Logger(GameGateway.name);

  private clients: ClientSocket[] = [];

  async afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Initialized');
  }

  async handleDisconnect(socket: Socket) {
    this.logger.log(`Client Disconnected: ${socket.id}`);
  }

  async handleConnection(socket: Socket) {
    this.logger.log(`Client Connected: ${socket.id}`);
  }

  @SubscribeMessage('start')
  async handleNewMessage(
    @MessageBody() data: any,
    @ConnectedSocket() socket: Socket,
  ) {
    this.logger.log(`Client trying to start is: ${JSON.stringify(data)}`);
    this.wss.sockets.emit('receive_message', data);
  }
}

export interface ClientSocket {
  socket: Socket;
}
