'use client'
import PingPongTable from "@/components/game/PingPongTable";
import PongNavBar from "@/components/nav/PongNavBar";
import PageLayout, { SocketContext } from "@/components/pageLayout/PageLayout";
import { Box, Button } from "@chakra-ui/react";
import { ReactElement, useContext } from "react";

function Game() {
  const socket = useContext(SocketContext)

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
      <Button
        onClick={() => {
          socket.emit('playerAction')
          console.log('emited');
        }}
      >teste</Button>
      <PingPongTable />
    </Box>
  );
}

Game.getLayout = function getLayoutPage(page: ReactElement) {
  return <PageLayout>{page}</PageLayout>;
};

export default Game;
