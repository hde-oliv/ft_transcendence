import { Injectable, UseFilters, Logger } from '@nestjs/common';
import { Game } from './game';
import { MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { ChatFilter } from 'src/chat/chat.filter';
import { WebsocketService } from 'src/chat/websocket.service';
@Injectable()
export class GameService {
  constructor(
    private readonly websocketService: WebsocketService
  ) {
    this.games = new Map();
  }
  private games: Map<string, Game>
  private readonly logger = new Logger(GameService.name);

  startGame(gameId: string, pOneId: string, pTwoId: string) {
    if (this.games.get(gameId) === undefined) {
      this.games.set('gameId', new Game(pOneId, pTwoId))
    }
    return (gameId)
  }
  finishGame(gameId: string) {
    this.games.delete(gameId);
  }
  getGames() {
    return this.games;
  }
  test() {
    this.logger.warn(`socketService users ${this.websocketService.clients.map((e => { return e.user.intra_login })).join(',')}`)
  }
  // @UseFilters(new ChatFilter())
  // @SubscribeMessage('playerAction')
  // async handlePlayerAction(
  //   @MessageBody() data: { gameId: string, action: { id: string, value: string } }
  // ) {
  //   this.logger.warn('RECEIVED MESSAGE-game')
  //   this.logger.warn(`${this.websocketService.clients}`)
  // }
}

// async afterInit(server: Server) {
//   this.logger.log('WebSocket Gateway Initialized');
//   const timer = setInterval(() => {
//     this.game.gameTick();
//     this.server.emit('game_data', this.game.getGameData())
//   }, 50);
// }
