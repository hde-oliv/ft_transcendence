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

export class Game {
  constructor(
    gameId: string,
    pOneId: { id: string, nickname: string },
    pTwoId: { id: string, nickname: string },
    socketService: WebsocketService,
  ) {
    this.id = gameId;
    this.endtime = null;
    this.status = 'ok';
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
    this.pOnePaddleY = 50;
    this.pTwoPaddleY = 50;
    this.score = {
      pOne: 0,
      pTwo: 0,
    };
    this.paused = true;
    this.tickInterval = 50;
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
  private pOnePaddleY: number;
  private pTwoPaddleY: number;
  private score: { pOne: number; pTwo: number };
  private paused: boolean;
  private tickInterval: number;
  private intervalObject: NodeJS.Timeout;
  private socketService: WebsocketService;
  private maxDisconnectedTime: number;
  private disconnectedTicks: number;
  private status: 'ok' | 'aborted';
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
    const biggerPos =
      this.ballPosition.y > this.pOnePaddleY
        ? this.ballPosition.y
        : this.pOnePaddleY;
    const smallerPos =
      this.ballPosition.y < this.pOnePaddleY
        ? this.ballPosition.y
        : this.pOnePaddleY;
    if (this.ballPosition.x <= 5 && biggerPos - smallerPos < 10) {
      if (this.ballPosition.x <= 2.5) {
        this.ballDirection = {
          x: -this.xAxisSpeed,
          y:
            this.yAxisDir == YAxisDirection.UP
              ? +this.ballPosition.y
              : -this.ballPosition.y,
        };
        this.ballPosition = {
          x: this.ballPosition.x - this.xAxisSpeed,
          y:
            this.yAxisDir == YAxisDirection.UP
              ? +this.ballPosition.y
              : -this.ballPosition.y,
        };
        this.ballPosition = {
          x: this.ballPosition.x + this.ballDirection.x,
          y: this.ballPosition.y + this.ballDirection.y,
        };
        this.ballPosition = {
          x: this.ballPosition.x + this.ballDirection.x,
          y: this.ballPosition.y + this.ballDirection.y,
        };
        return;
      }
      const racketDir: RacketDirection = Math.floor(Math.random() * 3) + 1;
      if (racketDir == RacketDirection.DEFAULT) {
        this.ballDirection = { ...this.ballDirection, x: +this.xAxisSpeed };
        this.ballPosition = {
          ...this.ballPosition,
          x: this.ballPosition.x + this.xAxisSpeed,
        };
        this.directCrossedBall = false;
      } else if (racketDir == RacketDirection.STRAIGHT) {
        this.ballDirection = { ...this.ballDirection, x: +this.xAxisSpeed };
        this.ballPosition = {
          ...this.ballPosition,
          x: this.ballPosition.x + this.xAxisSpeed,
        };
        this.directCrossedBall = true;
      } else {
        this.ballDirection = {
          x: +this.xAxisSpeed,
          y:
            this.yAxisDir == YAxisDirection.UP
              ? +this.yAxisSpeed
              : -this.yAxisSpeed,
        };
        this.ballPosition = {
          x: this.ballPosition.x + this.xAxisSpeed,
          y:
            this.yAxisDir == YAxisDirection.UP
              ? this.ballPosition.y + this.yAxisSpeed
              : this.ballPosition.y - this.yAxisSpeed,
        };
        this.directCrossedBall = false;
      }
    }
  }

  private checkIfTheBallHitsTheRightPaddle() {
    const biggerPos =
      this.ballPosition.y > this.pTwoPaddleY
        ? this.ballPosition.y
        : this.pTwoPaddleY;
    const smallerPos =
      this.ballPosition.y < this.pTwoPaddleY
        ? this.ballPosition.y
        : this.pTwoPaddleY;
    if (this.ballPosition.x >= 95 && biggerPos - smallerPos < 10) {
      if (this.ballPosition.x >= 97.5) {
        this.ballDirection = {
          x: +this.xAxisSpeed,
          y:
            this.yAxisDir == YAxisDirection.UP
              ? +this.ballPosition.y
              : -this.ballPosition.y,
        };
        this.ballPosition = {
          x: this.ballPosition.x + this.xAxisSpeed,
          y:
            this.yAxisDir == YAxisDirection.UP
              ? +this.ballPosition.y
              : -this.ballPosition.y,
        };
        this.ballPosition = {
          x: this.ballPosition.x + this.ballDirection.x,
          y: this.ballPosition.y + this.ballDirection.y,
        };
        this.ballPosition = {
          x: this.ballPosition.x + this.ballDirection.x,
          y: this.ballPosition.y + this.ballDirection.y,
        };
        return;
      }
      const racketDir: RacketDirection = Math.floor(Math.random() * 3) + 1;
      if (racketDir == RacketDirection.DEFAULT) {
        this.ballDirection = { ...this.ballDirection, x: -this.xAxisSpeed };
        this.ballPosition = {
          ...this.ballPosition,
          x: this.ballPosition.x - this.xAxisSpeed,
        };
        this.directCrossedBall = false;
      } else if (racketDir == RacketDirection.STRAIGHT) {
        this.ballDirection = { ...this.ballDirection, x: -this.xAxisSpeed };
        this.ballPosition = {
          ...this.ballPosition,
          x: this.ballPosition.x - this.xAxisSpeed,
        };
        this.directCrossedBall = true;
      } else {
        this.ballDirection = {
          x: -this.xAxisSpeed,
          y:
            this.yAxisDir == YAxisDirection.UP
              ? +this.yAxisSpeed
              : -this.yAxisSpeed,
        };
        this.ballPosition = {
          x: this.ballPosition.x - this.xAxisSpeed,
          y:
            this.yAxisDir == YAxisDirection.UP
              ? this.ballPosition.y + this.yAxisSpeed
              : this.ballPosition.y - this.yAxisSpeed,
        };
        this.directCrossedBall = false;
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
        pOne: this.pOnePaddleY,
        pTwo: this.pTwoPaddleY,
      },
      score: this.score,
      ended: this.endtime,
      status: this.status
    };
  }

  private movePlayerOne(direction: number) {
    if (direction > 0) this.pOnePaddleY += this.paddleIncrement;
    else this.pOnePaddleY -= this.paddleIncrement;
  }

  private movePlayerTwo(direction: number) {
    if (direction > 0) this.pTwoPaddleY += this.paddleIncrement;
    else this.pTwoPaddleY -= this.paddleIncrement;
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
      if (this.endtime !== null || this.status === 'aborted')
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
