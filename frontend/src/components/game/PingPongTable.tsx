import { Box, Flex, Heading, Kbd, Text } from "@chakra-ui/react";
import Score from "./Score";
import Paddle from "./Paddle";
import DashedLineSeparator from "./DashedLineSeparator";
import Ball from "./Ball";
import _ from 'lodash';
import { GameState } from '@/lib/dto/game.dto'
import CentralMsg from "./CentralMsg";

const PingPongTable: React.FC<GameState> = (props) => {
  const totalWidth = '47%';

  return (
    <>
      <Flex
        w={totalWidth}
        justifyContent={'space-between'}>
        <Heading size='md'>{props.playerOne.nickname}</Heading>
        <Heading size='md'>{props.playerTwo.nickname}</Heading>
      </Flex>
      <Box
        position={'relative'}
        w={totalWidth}
        h={'56%'}
        border={'2px solid white'}
        borderTop={'2px solid white'}
        borderBottom={'2px solid white'}
        borderLeft={'0px'}
        borderRight={'0px'}
        userSelect={'none'}
      >
        <Score side={{ left: '30%', }} counter={props.score.pOne} />
        <Score side={{ right: '30%', }} counter={props.score.pTwo} />
        {props.status !== 'running' ? <CentralMsg value={props.status} /> : undefined}
        <Paddle
          position={props.paddles.pOne.pos}
          length={props.paddles.pOne.length}
          side={{ left: '1.6%', }}
          color='blue'
        />

        <DashedLineSeparator />

        <Ball
          x={props.ballData.x}
          y={props.ballData.y}
        />

        <Paddle
          position={props.paddles.pTwo.pos}
          length={props.paddles.pTwo.length}
          side={{ right: '1.6%', }}
          color='red'
        />
        {/* {gameOver && <h2>{winner} is the winner!</h2>} */}
      </Box>
      <Flex justifyContent={'space-between'} w='40%' mt='0.5em' alignItems={'center'} userSelect={'none'}>
        <Flex flexDir={'column'}>
          <Flex>
            <Kbd boxSize='2em'>w</Kbd>
            <Text ml='0.5em'>Move up</Text>
          </Flex>
          <Flex>
            <Kbd boxSize='2em'>s</Kbd>
            <Text ml='0.5em'>Move Down</Text>
          </Flex>
        </Flex>
        <Flex>
          <Kbd boxSize='3em'>p</Kbd>
          <Text ml='0.5em'>Pause</Text>
        </Flex>
        <Flex>
          <Kbd boxSize='3em'>c</Kbd>
          <Text ml='0.5em'>Continue</Text>
        </Flex>
      </Flex>
    </>
  );
}
export default PingPongTable;
