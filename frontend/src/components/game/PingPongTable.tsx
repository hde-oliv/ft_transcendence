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

const PingPongTable: React.FC<GameState> = (props) => {
  const totalWidth = '47%';
  const [selectedMap, setSelectedMap] = useState('');

  const handleMapSelect = (map: string) => {
    setSelectedMap(map);
  }

  return (
    <>
      <Flex
        w={totalWidth}
        justifyContent={'space-between'}>
        <Heading size='md' mb={5}>{props.playerOne.nickname}</Heading>
        <Heading size='md'mb={5}>{props.playerTwo.nickname}</Heading>
      </Flex>
      <Flex justifyContent={'space-between'} mb={5}>
        <Box >
          <IconButton
            icon={<Img src={Maps.CLASSIC} w={'9vw'} m={2} />}
            aria-label={"Select tennis map"}
            onClick={() => setSelectedMap('')}
            colorScheme={selectedMap === '' ? Colors.ON : Colors.OFF}
            isActive={selectedMap === ''}
          />

          <IconButton
            icon={<Img src={Maps.BASKET} w={'9.5vw'} m={2}/>}
            aria-label={"Select basketball map"}
            onClick={() => handleMapSelect(Maps.BASKET)}
            colorScheme={selectedMap === Maps.BASKET ? Colors.ON : Colors.OFF}
            isActive={selectedMap === Maps.BASKET}
          />

          <IconButton
            icon={<Img src={Maps.SOCCER} w={'9.5vw'} m={2} />}
            aria-label={"Select soccer map"}
            onClick={() => handleMapSelect(Maps.SOCCER)}
            colorScheme={selectedMap === Maps.SOCCER ? Colors.ON : Colors.OFF}
            isActive={selectedMap === Maps.SOCCER}
          />

          <IconButton
            icon={<Img src={Maps.TENNIS} w={'19vh'} m={2} />}
            aria-label={"Select tennis map"}
            onClick={() => handleMapSelect(Maps.TENNIS)}
            colorScheme={selectedMap === Maps.TENNIS ? Colors.ON : Colors.OFF}
            isActive={selectedMap === Maps.TENNIS}
          />
        </Box>
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
        {props.status !== 'running' ? <CentralMsg value={props.status} /> : undefined}
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
