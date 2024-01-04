'use client'
import { Box } from "@chakra-ui/react";

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
      w={'1vh'}
      h={'1vh'}
      bgColor="white"
      left={`${x}%`}
      top={`${y}%`}
      transform="translate(-50%, -50%)"
    ></Box>
  );
}
