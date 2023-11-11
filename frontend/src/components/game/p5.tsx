import React from "react"; // @ts-ignore
import { type Sketch } from "@p5-wrapper/react"; // @ts-ignore
import { NextReactP5Wrapper } from "@p5-wrapper/next";

// @ts-ignore
const sketch: Sketch = (p5) => {
  let p: any;
  let b: any;
  let balls: any[] = [];
  let a: any;
  let lastPos;
  let go = false;

  // NOTE: With WEBGL the coordinates 0,0 starts at the middle of the canvas
  p5.setup = () => {
    p5.createCanvas(1620, 780);
    /* p = new Player();
     * b = new Ball(); */
    /* for (var i = 0; i < 4; i++) {
     *   balls[i] = new Ball();
     * }
     * a = new Ai(); */
  };

  function Ball(this: any) {
    this.x = p5.width / 2;
    this.y = p5.height / 2;
    var r = p5.floor(p5.random(2));
    this.xv = r === 0 ? -5 : 5;
    this.yv = 5;

    this.show = function () {
      p5.ellipse(this.x, this.y, 15, 15);
    };

    this.move = function () {
      if (this.y < 1) this.yv = 5;
      if (this.y >= p5.height) this.yv = -5;
      this.y += this.yv;
      this.x += this.xv;
    };

    this.collision = function (p: { x: any; y: number }) {
      var d = p5.dist(this.x, this.y, p.x, p.y);
      var r = p5.floor(p5.random(2));
      if (d < 15 + 20) {
        if (r === 1)
          if (this.y - p.y < 0) this.yv = 5;
          else if (this.y - p.y == 0) this.yv = 0;
          else this.yv = -5;
        return true;
      } else return false;
    };
  }

  function Player(this: any) {
    this.x = 0;
    this.y = p5.height / 2;
    this.velocityy = 4;
    this.w = 20;
    this.h = 80;
    this.points = 0;

    this.show = function () {
      p5.rectMode(p5.CENTER);
      p5.rect(this.x, this.y, this.w, this.h);
    };

    this.move = function (b: { x: number }) {
      if (b.x < p5.width / 2) {
        if (p.y < p5.mouseY) p.y += p.velocityy;
        else if (p.y > p5.mouseY) p.y -= p.velocityy;
      }
    };
  }

  function Ai(this: any) {
    this.x = p5.width;
    this.y = p5.height / 2;
    this.v = 3;
    this.w = 20;
    this.h = 80;
    this.points = 0;

    this.show = function () {
      p5.rectMode(p5.CENTER);
      p5.rect(this.x, this.y, this.w, this.h);
    };

    this.move = function (b: { x: number; y: number }) {
      if (b.x >= p5.width / 2)
        if (b.y < this.y) this.y -= this.v;
        else if (b.y > this.y) this.y += this.v;
    };
  }

  function throwBall() {
    if (balls.length > 0) b = balls.pop();
    else {
      showWinner();
      alert("Do you want to play again?");
      window.location.reload();
    }
  }

  function showWinner() {
    p5.background(0);
    p5.textSize(80);
    p5.fill(0, 102, 153);
    if (p.points > a.points)
      p5.text("YOU WIN", p5.width / 2 - 100, p5.height / 2);
    else if (a.points > p.points)
      p5.text("YOU LOSE", p5.width / 2 - 100, p5.height / 2);
    else p5.text("TIE", p5.width / 2 - 100, p5.height / 2);
  }

  p5.draw = () => {
    p5.background(0);
    p5.rect(p5.width / 2, 0, 10, 600);
    p5.textSize(48);
    p5.fill(0, 102, 153);
    p5.text(p.points, 30, 40);
    p5.text(a.points, p5.width - 80, 40);
    p.show();
    p.move(b);
    b.show();
    a.show();
    a.move(b);
    b.move();
    if (b.collision(p)) b.xv = 5;
    if (b.collision(a)) b.xv = -5;
    if (b.x < 0) {
      a.points++;
      throwBall();
    }
    if (b.x > p5.width) {
      p.points++;
      throwBall();
    }
  };
};

export default function GamePage() {
  return <NextReactP5Wrapper sketch={sketch} />;
}
