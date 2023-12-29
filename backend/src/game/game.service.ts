import { Injectable, UseFilters, Logger } from '@nestjs/common';
import { Game } from './game';
import { PlayerActionPayload } from './dto/game.dto';
import { MessageBody, SubscribeMessage, WebSocketGateway, WsException } from '@nestjs/websockets';
import { ChatFilter } from 'src/chat/chat.filter';
import { WebsocketService } from 'src/chat/websocket.service';
import { GameRepository } from './game.reposotory';
@Injectable()
export class GameService {
  constructor(
    private readonly gameRepository: GameRepository
  ) {
    this.games = new Map();
    this.watcher = setInterval(() => { this.finishedGameHandler() }, 1000);
  }
  private games: Map<string, Game>
  private readonly logger = new Logger(GameService.name);
  private watcher: NodeJS.Timeout

  buildGame(gameId: string, pOneId: string, pTwoId: string, socketService: WebsocketService) {
    const game = this.games.get(gameId)
    if (game === undefined) {
      const newGame = new Game(gameId, pOneId, pTwoId, socketService)
      this.games.set(gameId, newGame);
    }
    return (gameId)
  }
  finishGame(gameId: string) {
    this.games.get(gameId)
    this.games.delete(gameId);
  }
  getGamesByUser(userId: string) {
    const gameIds: string[] = [];
    this.games.forEach((e, k) => {
      if (e.getPlayers().includes(userId))
        gameIds.push(k);
    })
    return gameIds;
  }
  startGame(gameId) {
    const game = this.games.get(gameId)
    if (game !== undefined) {
      game.startGame();
    }
  }
  gameAction(userId: string, payload: PlayerActionPayload) {
    const game = this.games.get(payload.gameId);
    if (game === undefined)
      throw new WsException('Game not found.');
    game.handleGameAction(userId, payload);
  }
  private finishedGameHandler() {
    const deletableGames: string[] = []
    this.games.forEach((game, gameId) => {
      const gameData = game.getGameData();
      if (gameData.ended !== null) {
        if (gameData.ended.valueOf() < Date.now() - 1000) {
          deletableGames.push(gameId);
        }
      }
    });
    deletableGames.forEach(async (gameId) => {
      const gameData = this.games.get(gameId)?.getGameData();
      if (gameData) {
        try {
          await this.gameRepository.setGameFinished(gameData)
          this.games.delete(gameId);
        } catch (e) {
          this.logger.warn(`Could not remove game from runtime id: ${gameId}`)
        }
      }
    })
  }
}

// async afterInit(server: Server) {
//   this.logger.log('WebSocket Gateway Initialized');
//   const timer = setInterval(() => {
//     this.game.gameTick();
//     this.server.emit('game_data', this.game.getGameData())
//   }, 50);
// }
