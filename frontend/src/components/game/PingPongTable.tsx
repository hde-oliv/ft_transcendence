import { Box } from "@chakra-ui/react";
import Score from "./Score";
import Paddle from "./Paddle";
import DashedLineSeparator from "./DashedLineSeparator";
import Ball from "./Ball";
import { GameContext } from "@/contexts/GameContext";
import { SetStateAction, useCallback, useEffect, useState } from 'react'

import z from 'zod';
import { wsBaseUrl } from "@/lib/fetchers/pongAxios";
import { io } from "socket.io-client";
import { getToken } from "@/lib/TokenMagagment";
import { cloneDeep } from "lodash";

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

type gameState = z.infer<typeof gameData>;

export default function PingPongTable() {
  const [gameData, setGameData] = useState<gameState>({
    ballData: { x: 50, y: 50 },
    paddles: { pOne: 50, pTwo: 50 },
    score: { pOne: 0, pTwo: 0 }
  })
  const [winner, setWinner] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const websocketUrl = wsBaseUrl.concat('/game');
  const socket = io(websocketUrl, {
    autoConnect: false,
    extraHeaders: {
      Authorization: getToken(),
    },
    transports: ["websocket"],
  });
  function onGameData(payload: gameState) {
    setGameData(cloneDeep(payload));
  }
  useEffect(() => {
    socket.connect();
    socket.on('gameData', onGameData);
    return () => {
      socket.off('gameData', onGameData);
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (gameData.score.pOne === 5 || gameData.score.pTwo === 5) {
      setGameOver(true);
      if (gameData.score.pOne === 10)
        setWinner('Left player');
      else
        setWinner('Right player');
    }
  }, [gameData.score.pOne, gameData.score.pTwo])

  const movePonePaddle = (dir: number) => {
    socket.emit('move_left_paddle', dir)
  }
  const movePtwoPaddle = (dir: number) => {
    socket.emit('move_right_paddle', dir)
  }
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'w':
          movePonePaddle(-1);
          break;
        case 's':
          movePonePaddle(1);
          break;
        case 'o':
          movePtwoPaddle(-1);
          break;
        case 'l':
          movePtwoPaddle(1);
          break;
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => { document.removeEventListener('keydown', handleKeyDown) }
  }, [])
  return (
    <GameContext.Provider value={{ gameOver: gameOver }}>
      <Box
        position={'relative'}
        w={'47%'}
        h={'56%'}
        border={'2px solid white'}
        borderTop={'2px solid white'}
        borderBottom={'2px solid white'}
        borderLeft={'0px'}
        borderRight={'0px'}
      >
        <Score side={{ left: '30%', }} counter={gameData.score.pOne} />
        <Score side={{ right: '30%', }} counter={gameData.score.pTwo} />

        <Paddle
          position={gameData.paddles.pOne}
          side={{ left: '1.6%', }}
          color='blue'
        />

        <DashedLineSeparator />

        <Ball
          x={gameData.ballData.x}
          y={gameData.ballData.y}
        />

        <Paddle
          position={gameData.paddles.pTwo}
          side={{ right: '1.6%', }}
          color='red'
        />
        {/* {gameOver && <h2>{winner} is the winner!</h2>} */}
      </Box>
    </GameContext.Provider>
  );
}
