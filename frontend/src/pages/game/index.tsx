'use client'
import PingPongTable from "@/components/game/PingPongTable";
import PongNavBar from "@/components/nav/PongNavBar";
import PageLayout, { SocketContext } from "@/components/pageLayout/PageLayout";
import { Box, Button, VStack } from "@chakra-ui/react";
import { ReactElement, useCallback, useContext, useEffect } from "react";
import { playerActionPayload, PlayerActionPayload } from "../../lib/dto/game.dto";
import { useSearchParams } from 'next/navigation'


function Game() {
  const socket = useContext(SocketContext)
  const gameId = useSearchParams().get('id') as string;

  const connectAction: PlayerActionPayload = {
    type: 'connected',
    gameId,
    connected: true
  };
  const pauseAction: PlayerActionPayload = {
    type: 'pause',
    gameId,
    paused: true
  }
  const continueAction: PlayerActionPayload = {
    type: 'pause',
    gameId,
    paused: false
  }
  return (
    <Box className="App"
      display={'flex'}
      justifyContent={'center'}
      alignItems={'center'}
      h='100vh'
      backgroundColor={'#282c34'}
      border='1px'
      borderColor='blue'
    >
      <VStack>
        <Button
          onClick={() => {
            socket.emit('playerAction', connectAction)
          }}
        >connected</Button>
        <Button
          onClick={() => {
            socket.emit('playerAction', pauseAction)
          }}
        >pause</Button>
        <Button
          onClick={() => {
            socket.emit('playerAction', continueAction)
          }}
        >continue</Button>
      </VStack>
      <PingPongTable />
    </Box>
  );
}

Game.getLayout = function getLayoutPage(page: ReactElement) {
  return <PageLayout>{page}</PageLayout>;
};

export default Game;
