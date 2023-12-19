'use client'
import { GameContext } from "@/contexts/GameContext";
import { getToken } from "@/lib/TokenMagagment";
import { wsBaseUrl } from "@/lib/fetchers/pongAxios";
import { Box } from "@chakra-ui/react";
import { useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

enum RacketDirection {
  DEFAULT = 1,
  INVERTED = 2,
  STRAIGHT = 3,
}

enum YAxisDirection {
  UP = -1,
  DOWN = 1,
}

interface BallProps {
  x: number,
  y: number
}

export default function Ball({ x, y }: BallProps) {
  return (
    <Box
      position="absolute"
      w={'1vw'}
      h={'1vw'}
      bgColor="white"
      left={`${x}%`}
      top={`${y}%`}
      transform="translate(-50%, -50%)"
    ></Box>
  );
}
