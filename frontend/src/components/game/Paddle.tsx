import { Box } from "@chakra-ui/react";
import { useEffect } from "react";

interface PaddleProps {
  position: number;
  side: { left?: string, right?: string };
  color: string;
}

export default function Paddle({ position, side, color }: Readonly<PaddleProps>) {
  return (
    <Box
      position={'absolute'}
      w={'2%'}
      h={'16%'}
      bgColor={'white'}
      {...side}
      top={position + '%'}
      transform='translateY(-50%)'
      border={`1px solid ${color}`}
    ></Box>
  );
}
