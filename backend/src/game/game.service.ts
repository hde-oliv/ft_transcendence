import { Injectable, UseFilters, Logger } from '@nestjs/common';
import { Game } from './game';
import { PlayerActionPayload } from './dto/game.dto';
import { MessageBody, SubscribeMessage, WebSocketGateway, WsException } from '@nestjs/websockets';
import { ChatFilter } from 'src/chat/chat.filter';
import { WebsocketService } from 'src/chat/websocket.service';
@Injectable()
export class GameService {
  constructor(
  ) {
    this.games = new Map();
  }
  private games: Map<string, Game>
  private readonly logger = new Logger(GameService.name);

  buildGame(gameId: string, pOneId: string, pTwoId: string, socketService: WebsocketService) {
    const game = this.games.get(gameId)
    if (game === undefined) {
      const newGame = new Game(gameId, pOneId, pTwoId, socketService)
      this.games.set(gameId, newGame);
    }
    return (gameId)
  }
  finishGame(gameId: string) {
    this.games.delete(gameId);
  }
  getGames() {
    return this.games;
  }
  startGame(gameId) {
    const game = this.games.get(gameId)
    this.logger.log(`traying to start (id:${gameId})`)
    if (game !== undefined) {
      this.logger.log(`Game starting (id:${gameId})`)
      game.startGame();
    }
  }
  gameAction(userId: string, payload: PlayerActionPayload) {
    const game = this.games.get(payload.gameId);
    if (game === undefined)
      throw new WsException('Game not found.');
    game.handleGameAction(userId, payload);
  }
}

// async afterInit(server: Server) {
//   this.logger.log('WebSocket Gateway Initialized');
//   const timer = setInterval(() => {
//     this.game.gameTick();
//     this.server.emit('game_data', this.game.getGameData())
//   }, 50);
// }
