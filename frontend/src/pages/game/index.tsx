'use client'
import PingPongTable from "@/components/game/PingPongTable";
import PongNavBar from "@/components/nav/PongNavBar";
import PageLayout from "@/components/pageLayout/PageLayout";
import { Box } from "@chakra-ui/react";
import { ReactElement } from "react";

function Game() {
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
      <PingPongTable />
    </Box>
  );
}

Game.getLayout = function getLayoutPage(page: ReactElement) {
  return <PageLayout>{page}</PageLayout>;
};

export default Game;
