import z from 'zod'

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

enum RacketDirection {
  DEFAULT = 1,
  INVERTED = 2,
  STRAIGHT = 3,
}

enum YAxisDirection {
  UP = -1,
  DOWN = 1,
}

export class Game {

  constructor(pOneId: string, pTwoId: string) {
    this.playerOne = pOneId;
    this.playerTwo = pTwoId;
    this.paddleIncrement = 5;
    this.xAxisSpeed = 1.5;
    this.yAxisSpeed = 1.5;
    this.ballPosition = { x: 50, y: 50 };
    this.ballDirection = {
      x: Math.random() < 0.5 ? +this.xAxisSpeed : -this.xAxisSpeed,
      y: Math.random() < 0.5 ? +this.yAxisSpeed : -this.yAxisSpeed,
    }
    this.yAxisDir = YAxisDirection.UP;
    this.directCrossedBall = false;
    this.pOnePaddleY = 50;
    this.pTwoPaddleY = 50;
    this.score = {
      pOne: 0,
      pTwo: 0
    }
  }
  private playerOne: string;
  private playerTwo: string;
  private paddleIncrement
  private xAxisSpeed
  private yAxisSpeed
  private ballPosition
  private ballDirection
  private yAxisDir
  private directCrossedBall
  private pOnePaddleY
  private pTwoPaddleY
  private score


  gameTick() {
    // Check if the ball hits the vertical walls
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
      return;
    }


    // Check if the ball hits the horizontal walls
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


    // Check if the ball hits the left paddle
    let biggerPos =
      this.ballPosition.y > this.pOnePaddleY
        ? this.ballPosition.y
        : this.pOnePaddleY;
    let smallerPos =
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
      // const racketDir: RacketDirection = RacketDirection.DEFAULT;
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

    // Check if the ball hits the right paddle
    biggerPos =
      this.ballPosition.y > this.pTwoPaddleY
        ? this.ballPosition.y
        : this.pTwoPaddleY;
    smallerPos =
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
      // const racketDir: RacketDirection = RacketDirection.DEFAULT;
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
    this.ballPosition = this.updatePosition();
  }

  public updatePosition() {
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

  public getGameData(): gameState {
    return {
      ballData: this.ballPosition,
      paddles: {
        pOne: this.pOnePaddleY,
        pTwo: this.pTwoPaddleY
      },
      score: this.score
    }
  }

  public getBallPosition() {
    return this.ballPosition;
  }
  public setLeftPaddlePosition(position: number) {
    if (position > 0)
      this.pOnePaddleY += this.paddleIncrement;
    else
      this.pOnePaddleY -= this.paddleIncrement;
  }

  public setRightPaddlePosition(position: number) {
    if (position > 0)
      this.pTwoPaddleY += this.paddleIncrement;
    else
      this.pTwoPaddleY -= this.paddleIncrement;
  }
  public getLeftScore() {
    return this.score.p_one;
  }
  public getRightScore() {
    return this.score.p_two;
  }
}
