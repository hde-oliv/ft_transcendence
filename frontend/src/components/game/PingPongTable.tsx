import { Box, Flex, Kbd, Text } from "@chakra-ui/react";
import Score from "./Score";
import Paddle from "./Paddle";
import DashedLineSeparator from "./DashedLineSeparator";
import Ball from "./Ball";
import { GameContext } from "@/contexts/GameContext";
import { useCallback, useContext, useEffect, useState } from 'react'
import { cloneDeep } from "lodash";
import { GameState, PlayerActionPayload } from '@/lib/dto/game.dto'
import { SocketContext } from "../pageLayout/PageLayout";
import { useSearchParams } from "next/navigation";


const PingPongTable: React.FC<GameState> = (props) => {

  return (
    <>
      <Box
        position={'relative'}
        w={'47%'}
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

        <Paddle
          position={props.paddles.pOne}
          side={{ left: '1.6%', }}
          color='blue'
        />

        <DashedLineSeparator />

        <Ball
          x={props.ballData.x}
          y={props.ballData.y}
        />

        <Paddle
          position={props.paddles.pTwo}
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
