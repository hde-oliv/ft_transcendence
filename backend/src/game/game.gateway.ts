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
import z from 'zod';

const ballData = z.object({
  x: z.number(),
  y: z.number()
})
const score = z.object({
  pOne: z.number().int(),
  pTwo: z.number().int()
})
const paddles = z.object({
  pOne: z.number(),
  pTwo: z.number()
})

const gameData = z.object({
  ballData: ballData,
  score: score,
  paddles: paddles
})

export type gameState = z.infer<typeof gameData>;

@WebSocketGateway({
  namespace: 'game',
  cors: {
    origin: '*',
  },
  transports: ['websocket'],
})
export class GameGateway
  implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private game: Game;

  constructor(private socketService: WebsocketService) { }

  private readonly logger = new Logger(GameGateway.name);

  async afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Initialized');
    this.game = new Game();
    const timer = setInterval(() => {
      this.game.gameTick();
      this.server.emit('game_data', this.game.getGameData())
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
    @MessageBody() dir: number,
    @ConnectedSocket() socket: Socket,
  ) {
    this.logger.log(
      `Client trying to move left paddle to: ${JSON.stringify(dir)}`,
    );
    this.game.setLeftPaddlePosition(dir);
  }

  @SubscribeMessage('move_right_paddle')
  async handleMoveRightPaddle(
    @MessageBody() dir: number,
    @ConnectedSocket() socket: Socket,
  ) {
    this.logger.log(
      `Client trying to move right paddle to: ${JSON.stringify(dir)}`,
    );
    this.game.setRightPaddlePosition(dir);
  }
}
