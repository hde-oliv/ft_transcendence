

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
  private xAxisSpeed = 1.5;
  private yAxisSpeed = 1.5;
  private ballPosition = { x: 50, y: 50 };
  private ballDirection = {
    x: Math.random() < 0.5 ? +this.xAxisSpeed : -this.xAxisSpeed,
    y: Math.random() < 0.5 ? +this.yAxisSpeed : -this.yAxisSpeed,
  };
  private yAxisDir = YAxisDirection.UP;
  private directCrossedBall = false;

  private leftPaddlePosition = 50;
  private rightPaddlePosition = 50;

  private leftScore = 0;
  private rightScore = 0;

  // public constructor() {
  // }

  moveBall() {
    // Check if the ball hits the vertical walls
    if (this.ballPosition.x <= 0 || this.ballPosition.x >= 100) {
      if (this.ballPosition.x <= 0) {
        this.rightScore++;
      } else {
        this.leftScore++;
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
      this.ballPosition.y > this.leftPaddlePosition
        ? this.ballPosition.y
        : this.leftPaddlePosition;
    let smallerPos =
      this.ballPosition.y < this.leftPaddlePosition
        ? this.ballPosition.y
        : this.leftPaddlePosition;
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
      this.ballPosition.y > this.rightPaddlePosition
        ? this.ballPosition.y
        : this.rightPaddlePosition;
    smallerPos =
      this.ballPosition.y < this.rightPaddlePosition
        ? this.ballPosition.y
        : this.rightPaddlePosition;
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

  public getBallPosition() {
    return this.ballPosition;
  }

  public setLeftPaddlePosition(position: number) {
    this.leftPaddlePosition = position;
  }

  public setRightPaddlePosition(position: number) {
    this.rightPaddlePosition = position;
  }

  public getLeftScore() {
    return this.leftScore;
  }

  public getRightScore() {
    return this.rightScore;
  }
}
