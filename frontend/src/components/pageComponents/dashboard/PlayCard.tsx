"use client";
import { PropsWithChildren, useContext, useEffect } from "react";
import { Button, Center } from "@chakra-ui/react";
import { joinQueue } from "@/lib/fetchers/matches";
import { SocketContext } from "@/components/pageLayout/PageLayout";

export default function PlayCard(props: PropsWithChildren) {
  const socket = useContext(SocketContext);

  const tmp = () => { alert('matched'); }

  useEffect(() => {
    socket.on('matched', tmp)
    return () => {
      socket.off('matched', tmp)
    }
  }, [socket]);
  return (
    <Center
      flexDir="column"
      alignItems="stretch"
      h="370px"
      w="370px"
      justifyContent="space-between"
    >
      <Button
        borderRadius="45"
        h="45%"
        backgroundColor="yellow.300"
        color="pongBlue.400"
        onClick={() => { joinQueue(); }}
      >
        Play now
      </Button>
    </Center>
  );
}
