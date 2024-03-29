import { Box, Flex, Heading, IconButton, Img, Kbd, Text } from "@chakra-ui/react";
import Score from "./Score";
import Paddle from "./Paddle";
import DashedLineSeparator from "./DashedLineSeparator";
import Ball from "./Ball";
import _ from 'lodash';
import { GameState } from '@/lib/dto/game.dto'
import CentralMsg from "./CentralMsg";
import { useState } from "react";

enum Maps {
  BASKET = '/images/maps/basket.jpg',
  CLASSIC = '/images/maps/classic.png',
  SOCCER = '/images/maps/soccer.jpg',
  TENNIS = '/images/maps/tennis.jpg',
}

enum Colors {
  ON = 'red',
  OFF = 'orange',
}

const centerMsg = (status: GameState['status'], pOne: { id: string, nickname: string, connected: boolean }, pTwo: { id: string, nickname: string, connected: boolean }) => {
  if (status === 'paused')
    return 'Paused';
  if (status === 'running') {
    if (pOne.connected && pTwo.connected)
      return ''
    if (pOne.connected && !pTwo.connected)
      return `Waiting ${pTwo.nickname}`
    if (!pOne.connected && pTwo.connected)
      return `Waiting ${pOne.nickname}`
  }
  if (status === 'finished')
    return 'Finished';
  if (status === 'aborted')
    return 'Aborted'
  return 'Error'
}
const PingPongTable: React.FC<GameState> = (props) => {
  const totalWidth = '47%';
  const [selectedMap, setSelectedMap] = useState('');


  return (
    <>
      <Flex
        w={totalWidth}
        justifyContent={'space-between'}>
        <Flex alignItems={'center'}>
          <Heading size='md'>{props.playerOne.nickname}</Heading>
          <Box borderRadius={'50%'} bg={props.playerOne.connected ? 'green.300' : 'red.300'} h='1em' w='1em' ml='1em' />
        </Flex>
        <Flex alignItems={'center'}>
          <Box borderRadius={'50%'} bg={props.playerTwo.connected ? 'green.300' : 'red.300'} h='1em' w='1em' mr='1em' />
          <Heading size='md'>{props.playerTwo.nickname}</Heading>
        </Flex>
      </Flex>
      <Flex >
        <Img
          src={Maps.CLASSIC} w={'9vw'} m={2}
          onClick={() => setSelectedMap('')}
          aria-label="Select tennis map"
          borderStyle={'solid'}
          borderWidth={3}
          borderColor={selectedMap === '' ? 'yellow.400' : 'transparent'}
        />

        <Img
          src={Maps.BASKET} w={'9.5vw'} m={2}
          aria-label={"Select basketball map"}
          onClick={() => setSelectedMap(Maps.BASKET)}
          borderStyle={'solid'}
          borderWidth={3}
          borderColor={selectedMap === Maps.BASKET ? 'yellow.400' : 'transparent'}
        />

        <Img
          src={Maps.SOCCER} w={'9.5vw'} m={2}
          aria-label={"Select soccer map"}
          onClick={() => setSelectedMap(Maps.SOCCER)}
          borderStyle={'solid'}
          borderWidth={3}
          borderColor={selectedMap === Maps.SOCCER ? 'yellow.400' : 'transparent'}
        />

        <Img
          src={Maps.TENNIS} w={'19vh'} m={2}
          aria-label={"Select tennis map"}
          onClick={() => setSelectedMap(Maps.TENNIS)}
          borderStyle={'solid'}
          borderWidth={3}
          borderColor={selectedMap === Maps.TENNIS ? 'yellow.400' : 'transparent'}
        />
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
        bgImg={`url(${selectedMap})`}
        bgSize={'cover'}
        bgRepeat={'no-repeat'}
        bgPosition={'center'}
      >
        <Score side={{ left: '30%', }} counter={props.score.pOne} />
        <Score side={{ right: '30%', }} counter={props.score.pTwo} />
        <CentralMsg value={centerMsg(props.status, props.playerOne, props.playerTwo)} />
        <Paddle
          position={props.paddles.pOne.pos}
          length={props.paddles.pOne.length}
          side={{ left: '0%', }}
          color='blue'
        />

        {selectedMap === '' && <DashedLineSeparator />}

        <Ball
          x={props.ballData.x}
          y={props.ballData.y}
        />

        <Paddle
          position={props.paddles.pTwo.pos}
          length={props.paddles.pTwo.length}
          side={{ right: '0%', }}
          color='red'
        />
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
