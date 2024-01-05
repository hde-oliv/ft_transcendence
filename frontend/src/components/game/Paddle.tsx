import { Box } from "@chakra-ui/react";
import { useEffect } from "react";

interface PaddleProps {
  position: number;
  length: number;
  side: { left?: string, right?: string };
  color: string;
}

export default function Paddle({ position, side, color, length }: Readonly<PaddleProps>) {
  return (
    <Box
      position={'absolute'}
      w={'1%'}
      h={`${length}%`}
      bgColor={'white'}
      {...side}
      top={position + '%'}
      border={`1px solid ${color}`}
    ></Box>
  );
}
