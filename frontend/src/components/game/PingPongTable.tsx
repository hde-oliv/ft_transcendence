import { Box } from "@chakra-ui/react";
import Score from "./Score";
import Paddle from "./Paddle";
import DashedLineSeparator from "./DashedLineSeparator";
import Ball from "./Ball";
import { GameContext } from "@/contexts/GameContext";
import { useCallback, useContext, useEffect, useState } from 'react'
import { cloneDeep } from "lodash";
import { GameState, PlayerActionPayload } from '@/lib/dto/game.dto'
import { SocketContext } from "../pageLayout/PageLayout";
import { useSearchParams } from "next/navigation";


export default function PingPongTable() {
  const socket = useContext(SocketContext);
  const [gameData, setGameData] = useState<GameState>({
    ballData: { x: 50, y: 50 },
    paddles: { pOne: 50, pTwo: 50 },
    score: { pOne: 0, pTwo: 0 }
  })
  const [winner, setWinner] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const gameId = useSearchParams().get('id') as string;

  const onGameData = useCallback((payload: GameState) => {
    setGameData(cloneDeep(payload))
  }, [socket])
  useEffect(() => {
    socket.on('gameData', onGameData);
    return () => {
      socket.off('gameData', onGameData);
    };
  }, [onGameData]);

  useEffect(() => {
    if (gameData.score.pOne === 5 || gameData.score.pTwo === 5) {
      setGameOver(true);
      if (gameData.score.pOne === 10)
        setWinner('Left player');
      else
        setWinner('Right player');
    }
  }, [gameData.score.pOne, gameData.score.pTwo])

  const movePaddle = (dir: number) => {
    const payload: PlayerActionPayload = {
      type: 'movePaddle',
      dir,
      gameId
    }
    socket.emit('playerAction', payload)
  }
  const movePtwoPaddle = (dir: number) => {
    socket.emit('playerAction', dir)
  }
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'w':
          movePaddle(-1);
          break;
        case 's':
          movePaddle(1);
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
