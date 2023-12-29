import { Text } from "@chakra-ui/react";

interface ScoreProps {
  side: { left?: string, right?: string };
  counter: number;
}

export default function Score({ side, counter }: ScoreProps) {
  return (
    <Text
      userSelect={'none'}
      position="absolute"
      top="3%"
      {...side}
      fontSize="3vw"
      color="white"
      as='b'
    >{counter}</Text>
  );
}
