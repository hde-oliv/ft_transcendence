import { WsException } from '@nestjs/websockets';
import { ZodError } from 'zod';
import {
  YAxisDirection,
  RacketDirection,
  GameState,
  PlayerActionPayload,
  playerActionPayload,
} from './dto/game.dto';
import { WebsocketService } from 'src/chat/websocket.service';
import _ from 'lodash'

function generateUniformRanges(x1: number, x2: number, s: number): Array<number> {
  const ranges: number[] = [];

  if (s <= 1) {
    ranges.push(x2);
  } else {
    const step = (x2 - x1) / (s - 1);
    for (let i = 0; i < s; i++) {
      ranges.push(x1 + step * i);
    }
  }

  return ranges;
}
export class Game {
  constructor(
    gameId: string,
    pOneId: { id: string, nickname: string },
    pTwoId: { id: string, nickname: string },
    socketService: WebsocketService,
  ) {
    this.id = gameId;
    this.endtime = null;
    this.status = 'paused';
    this.maxDisconnectedTime = 20000;
    this.disconnectedTicks = 0;
    this.playerOne = { ...pOneId, connected: false };
    this.playerTwo = { ...pTwoId, connected: false };
    this.paddleIncrement = 5;
    this.xAxisSpeed = 1.5;
    this.yAxisSpeed = 1.5;
    this.ballPosition = { x: 50, y: 50 };
    this.ballDirection = {
      x: Math.random() < 0.5 ? +this.xAxisSpeed : -this.xAxisSpeed,
      y: Math.random() < 0.5 ? +this.yAxisSpeed : -this.yAxisSpeed,
    };
    this.yAxisDir = YAxisDirection.UP;
    this.directCrossedBall = false;
    this.paddleOne = {
      pos: 40,
      length: 20
    }
    this.paddleTwo = {
      pos: 40,
      length: 20
    }
    this.pOnePaddleY = 50;
    this.pTwoPaddleY = 50;
    this.score = {
      pOne: 0,
      pTwo: 0,
    };
    this.paused = true;
    this.tickInterval = 75;
    this.socketService = socketService;
  }
  private id: string;
  private playerOne: GameState['playerOne'];
  private playerTwo: GameState['playerTwo'];
  private paddleIncrement: number;
  private xAxisSpeed: number;
  private yAxisSpeed: number;
  private ballPosition: { x: number; y: number };
  private ballDirection: { x: number; y: number };
  private yAxisDir: number;
  private directCrossedBall: boolean;
  private paddleOne: GameState['paddles']['pOne']
  private paddleTwo: GameState['paddles']['pTwo']
  private pOnePaddleY: number;
  private pTwoPaddleY: number;
  private score: { pOne: number; pTwo: number };
  private paused: boolean;
  private tickInterval: number;
  private intervalObject: NodeJS.Timeout;
  private socketService: WebsocketService;
  private maxDisconnectedTime: number;
  private disconnectedTicks: number;
  private status: GameState['status'];
  private endtime: Date | null;

  private CheckIfItWasMadePointByThePlayers() {
    if (this.ballPosition.x <= 0 || this.ballPosition.x >= 100) {
      if (this.ballPosition.x <= 0) {
        this.score.pTwo++;
      } else {
        this.score.pOne++;
      }
      this.ballPosition = { x: 50, y: 50 };
      this.ballDirection = {
        x: Math.random() < 0.5 ? +this.xAxisSpeed : -this.xAxisSpeed,
        y: Math.random() < 0.5 ? +this.yAxisSpeed : -this.yAxisSpeed,
      };
    }
  }

  private checkIfTheBallHitTheSidelines() {
    if (this.ballPosition.y <= 3.5) {
      this.ballDirection = { ...this.ballDirection, y: +this.yAxisSpeed };
      this.yAxisDir = YAxisDirection.DOWN;
      this.directCrossedBall = false;
    }

    if (this.ballPosition.y >= 96.5) {
      this.ballDirection = { ...this.ballDirection, y: -this.yAxisSpeed };
      this.yAxisDir = YAxisDirection.UP;
      this.directCrossedBall = false;
    }
  }

  private checkIfTheBallHitsTheLeftPaddle() {
    const { x, y } = this.ballPosition;
    if (x <= 5) {
      const start = this.paddleOne.pos;
      const end = this.paddleOne.pos + this.paddleOne.length
      if (y >= start && y <= end) {
        this.ballDirection.x *= -1;
        const by = y - start;
        const piy = 0;
        const pey = end - start;
        const sections = 13; //This number should be always odd
        const middleSectionIndex = Math.floor(sections / 2); //this is the index of the center section, also the total section for each direction
        const yVector = 4.5;
        const negativeYvecs = generateUniformRanges(-yVector, 0, middleSectionIndex + 1);
        const positiveYVecs = generateUniformRanges(0, yVector, middleSectionIndex + 1);
        positiveYVecs.shift();
        const yVectors = [...negativeYvecs, ...positiveYVecs];
        const upperBounds = generateUniformRanges(piy, pey, sections);
        const bHitIndex = upperBounds.findIndex((uBound) => by <= uBound)
        this.ballDirection.y = yVectors[bHitIndex];
      }
    }
  }

  private checkIfTheBallHitsTheRightPaddle() {
    const { x, y } = this.ballPosition;
    if (x >= 95) {
      const start = this.paddleTwo.pos;
      const end = this.paddleTwo.pos + this.paddleTwo.length
      if (y >= start && y <= end) {
        this.ballDirection.x *= -1;
        const by = y - start;
        const piy = 0;
        const pey = end - start;
        const sections = 13; //This number should be always odd, so that the middle section reflects the ball normal to the paddle
        const middleSectionIndex = Math.floor(sections / 2); //this is the index of the center section, also the total section for each direction
        const yVector = 4.5;
        const negativeYvecs = generateUniformRanges(-yVector, 0, middleSectionIndex + 1);
        const positiveYVecs = generateUniformRanges(0, yVector, middleSectionIndex + 1);
        positiveYVecs.shift();
        const yVectors = [...negativeYvecs, ...positiveYVecs];
        const upperBounds = generateUniformRanges(piy, pey, sections);
        const bHitIndex = upperBounds.findIndex((uBound) => by <= uBound)
        this.ballDirection.y = yVectors[bHitIndex];
      }
    }
  }

  private updatePosition() {
    if (this.directCrossedBall) {
      return {
        ...this.ballPosition,
        x: this.ballPosition.x + this.ballDirection.x,
      };
    }
    return {
      x: this.ballPosition.x + this.ballDirection.x,
      y: this.ballPosition.y + this.ballDirection.y,
    };
  }
  private broadcastState() {
    const gameData = this.getGameData();
    this.socketService.emitToRoom(this.id, 'gameData', gameData);
  }
  private abortGame() { //a players that disconnects looses, if both disconnect, its a tie
    if (this.playerOne.connected && !this.playerTwo.connected) {
      this.score = {
        pOne: 1,
        pTwo: 0
      }
    } else if (!this.playerOne.connected && this.playerTwo.connected) {
      this.score = {
        pOne: 0,
        pTwo: 1
      }
    } else {
      this.score = {
        pOne: 0,
        pTwo: 0
      }
    }
    this.endtime = new Date();
    this.status = 'aborted';
    this.stopGame();
  }
  private finishGame() {
    this.ballPosition = {
      x: 50,
      y: 50
    }
    this.status = 'finished'
    this.endtime = new Date();
    this.stopGame();
  }
  private gameTick() {
    if (!this.paused && this.playerOne.connected && this.playerTwo.connected) {
      this.CheckIfItWasMadePointByThePlayers();
      this.checkIfTheBallHitTheSidelines();
      this.checkIfTheBallHitsTheLeftPaddle();
      this.checkIfTheBallHitsTheRightPaddle();
      this.ballPosition = this.updatePosition();
    }
    this.checkConnections();
    this.broadcastState();
  }

  private checkConnections() {
    if (!this.playerOne.connected || !this.playerTwo.connected) {
      this.disconnectedTicks++;
    } else {
      this.disconnectedTicks = 0;
    }
    if (this.disconnectedTicks * this.tickInterval > this.maxDisconnectedTime) {
      this.abortGame();
    }
    if (this.score.pOne >= 5 || this.score.pTwo >= 5)
      this.finishGame();
  }

  public getGameData(): GameState {
    return {
      gameId: this.id,
      playerOne: this.playerOne,
      playerTwo: this.playerTwo,
      ballData: this.ballPosition,
      paddles: {
        pOne: this.paddleOne,
        pTwo: this.paddleTwo,
      },
      score: this.score,
      ended: this.endtime,
      status: this.status
    };
  }

  private movePlayerOne(direction: number) {
    if (direction > 0) {
      this.paddleOne.pos += this.paddleIncrement;
      if (this.paddleOne.pos + this.paddleOne.length > 100) {
        this.paddleOne.pos = 100 - this.paddleOne.length;
      }
    } else {
      this.paddleOne.pos -= this.paddleIncrement;
      if (this.paddleOne.pos < 0)
        this.paddleOne.pos = 0;
    }
  }

  private movePlayerTwo(direction: number) {
    if (direction > 0) {
      this.paddleTwo.pos += this.paddleIncrement;
      if (this.paddleTwo.pos + this.paddleTwo.length > 100) {
        this.paddleTwo.pos = 100 - this.paddleTwo.length;
      }
    } else {
      this.paddleTwo.pos -= this.paddleIncrement;
      if (this.paddleTwo.pos < 0)
        this.paddleTwo.pos = 0;
    }
  }

  private movePlayerPaddle(
    player: 'playerOne' | 'playerTwo',
    direction: number,
  ) {
    if (this.paused)
      return;
    if (player === 'playerOne') return this.movePlayerOne(direction);
    if (player === 'playerTwo') return this.movePlayerTwo(direction);
  }

  private evalPlayerId(userId: string) {
    if (userId === this.playerOne.id) return 'playerOne';
    if (userId === this.playerTwo.id) return 'playerTwo';
    throw new WsException('Forbidden action');
  }

  private setPaused(newValue: boolean) {
    this.paused = newValue;
    this.status = newValue ? 'paused' : 'running'
  }

  private setPlayerOneConnected(newState: boolean) {
    this.playerOne.connected = newState;
  }

  private setPlayerTwoConnected(newState: boolean) {
    this.playerTwo.connected = newState;
  }

  private setConnected(player: 'playerOne' | 'playerTwo', newState: boolean) {
    if (player === 'playerOne') return this.setPlayerOneConnected(newState);
    if (player === 'playerTwo') return this.setPlayerTwoConnected(newState);
  }

  public startGame() {
    this.intervalObject = setInterval(() => {
      this.gameTick();
    }, this.tickInterval);
  }

  public stopGame() {
    clearInterval(this.intervalObject);
  }

  public handleGameAction(userId: string, action: PlayerActionPayload) {
    try {
      const parsedAction = playerActionPayload.parse(action);
      const whoIs = this.evalPlayerId(userId);
      if (this.endtime !== null || this.status === 'aborted' || this.status === 'finished')
        return
      switch (parsedAction.type) {
        case 'movePaddle':
          this.movePlayerPaddle(whoIs, parsedAction.dir);
          break;
        case 'pause':
          this.setPaused(parsedAction.paused);
          break;
        case 'quit':
          console.log(`Player ${userId} quit`);
          break;
        case 'connected':
          this.setConnected(whoIs, parsedAction.connected);
          break;
      }
    } catch (e) {
      if (e instanceof ZodError) {
        throw new WsException('Unknown action');
      }
      throw new WsException('Bad request');
    }
  }

  public getPlayers() {
    return [this.playerOne, this.playerTwo];
  }
}
