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
import { WebsocketService } from 'src/chat/websocket.service';
import { Game } from './game';

@WebSocketGateway({
  namespace: 'game',
  cors: {
    origin: '*',
  },
  transports: ['websocket'],
})
export class GameGateway
  implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;
  private game: Game;

  constructor(private socketService: WebsocketService) {}

  private readonly logger = new Logger(GameGateway.name);

  async afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Initialized');
    this.game = new Game();
    const timer = setInterval(() => {
      this.game.moveBall();
      this.server.emit('move_ball', this.game.getBallPosition());
    }, 50);
  }

  async handleDisconnect(socket: Socket) {
    this.logger.log(`Client Disconnected: ${socket.id}`);
  }

  async handleConnection(socket: Socket) {
    this.logger.log(`Client Connected: ${socket.id}`);
  }

  @SubscribeMessage('move_left_paddle')
  async handleMoveLeftPaddle(
    @MessageBody() data: number,
    @ConnectedSocket() socket: Socket,
  ) {
    this.logger.log(
      `Client trying to move left paddle to: ${JSON.stringify(data)}`,
    );
    this.game.setLeftPaddlePosition(data);
    this.server.emit('move_left_paddle', data);
  }

  @SubscribeMessage('move_right_paddle')
  async handleMoveRightPaddle(
    @MessageBody() data: number,
    @ConnectedSocket() socket: Socket,
  ) {
    this.logger.log(
      `Client trying to move right paddle to: ${JSON.stringify(data)}`,
    );
    this.game.setRightPaddlePosition(data);
    this.server.emit('move_right_paddle', data);
  }
}
