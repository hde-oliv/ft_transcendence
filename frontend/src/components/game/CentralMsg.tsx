import { Heading } from "@chakra-ui/react";
import _ from 'lodash'
import { FC } from "react";

interface ScoreProps {
  side: { left?: string, right?: string };
  counter: number;
}

const CentralMsg: FC<{ value: string }> = (props) => {
  if (props.value === '')
    return undefined
  return (
    <Heading size='lg'
      bg='pongBlue.400'
      zIndex={100}
      userSelect={'none'}
      position="absolute"
      top="50%"
      left="50%"
      padding='1em'
      transform={'translate(-50%, -50%)'}
      textAlign={'center'}
      margin={'auto'}
      fontSize="3vw"
      color="white"
      as='b'
    >{_.capitalize(props.value)}</Heading>
  );
}
export default CentralMsg
