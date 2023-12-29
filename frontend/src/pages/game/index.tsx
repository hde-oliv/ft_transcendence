'use client'
import PingPongTable from "@/components/game/PingPongTable";
import PongNavBar from "@/components/nav/PongNavBar";
import PageLayout, { SocketContext } from "@/components/pageLayout/PageLayout";
import { Box, Button, Kbd, VStack } from "@chakra-ui/react";
import { ReactElement, useCallback, useContext, useEffect, useState } from "react";
import { GameState, playerActionPayload, PlayerActionPayload } from "../../lib/dto/game.dto";
import { useSearchParams } from 'next/navigation'
import { cloneDeep } from "lodash";


function Game() {
  const socket = useContext(SocketContext);
  const [gameData, setGameData] = useState<GameState>({
    gameId: '',
    playerOne: { id: '', nickname: '', connected: false },
    playerTwo: { id: '', nickname: '', connected: false },
    ballData: { x: 50, y: 50 },
    paddles: { pOne: 50, pTwo: 50 },
    score: { pOne: 0, pTwo: 0 },
    ended: null,
    status: 'ok'
  })
  const gameId = useSearchParams().get('id') as string;

  const movePaddle = (dir: number) => {
    const payload: PlayerActionPayload = {
      type: 'movePaddle',
      dir,
      gameId
    }
    socket.emit('playerAction', payload)
  }
  const pauseAction = (pause: boolean) => {
    const action: PlayerActionPayload = {
      type: 'pause',
      gameId: gameId,
      paused: pause
    }
    socket.emit('playerAction', action);
  }

  const onGameData = useCallback((payload: GameState) => {
    if (payload.gameId === gameId)
      setGameData(cloneDeep(payload));
    if (payload.ended !== null)
      console.log(payload)
  }, []);
  useEffect(() => {
    socket.on('gameData', onGameData);
    return () => {
      socket.off('gameData', onGameData);
    };
  }, [onGameData, socket]);
  useEffect(() => {
    socket.emit('playerAction', { type: 'connected', gameId, connected: true })
    return () => {
      socket.emit('playerAction', { type: 'connected', gameId, connected: false })
    }
  }, [])
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'w':
          movePaddle(-1);
          break;
        case 's':
          movePaddle(1);
          break;
        case 'c':
          pauseAction(false);
          break;
        case 'p':
          pauseAction(true);
          break;
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => { document.removeEventListener('keydown', handleKeyDown) }
  }, [movePaddle])
  return (
    <Box className="App"
      display={'flex'}
      flexDir={'column'}
      justifyContent={'center'}
      alignItems={'center'}
      h='100vh'
      // backgroundColor={'#282c34'}
      border='1px'
      borderColor='blue'
    >
      <PingPongTable {...gameData} />
    </Box>
  );
}

Game.getLayout = function getLayoutPage(page: ReactElement) {
  return <PageLayout>{page}</PageLayout>;
};

export default Game;
