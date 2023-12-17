import { Box } from "@chakra-ui/react";
import Score from "./Score";
import Paddle from "./Paddle";
import DashedLineSeparator from "./DashedLineSeparator";
import Ball from "./Ball";
import { SetStateAction, useCallback, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { getToken } from "@/lib/TokenMagagment";
import { wsBaseUrl } from "@/lib/fetchers/pongAxios";
import { GameContext } from "@/contexts/GameContext";
import { set } from "lodash";

export default function PingPongTable() {
  const [leftScore, setLeftScore] = useState(0);
	const [rightScore, setRightScore] = useState(0);
	const [leftPaddlePosition, setLeftPaddlePosition] = useState(50);
	const [rightPaddlePosition, setRightPaddlePosition] = useState(50);
  const [winner, setWinner] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const websocketUrl = wsBaseUrl.concat('/game');
  const socket = io(websocketUrl, {
    autoConnect: false,
    extraHeaders: {
      Authorization: getToken(),
    },
    transports: ["websocket"],
  });

  useEffect(() => {
    socket.connect();
    socket.on('move_left_paddle', setLeftPaddlePosition);
    socket.on('move_right_paddle', setRightPaddlePosition);
    socket.on('left_score', setLeftScore);
    socket.on('right_score', setRightScore);
    return () => {
      socket.off('move_left_paddle', setLeftPaddlePosition);
      socket.off('move_right_paddle', setRightPaddlePosition);
      socket.off('left_scored', setLeftScore);
      socket.off('right_scored', setRightScore);
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (leftScore === 5 || rightScore === 5) {
      setGameOver(true);
      if (leftScore === 10)
        setWinner('Left player');
      else
        setWinner('Right player');
    }
  }, [leftScore, rightScore])

	const scorePointForLeftPlayer = useCallback(() => {
		setLeftScore(leftScore + 1);
	}, [leftScore]);

	const scorePointForRightPlayer = useCallback(() => {
		setRightScore(rightScore + 1);
	}, [rightScore]);

	const movePaddleLeft = useCallback(async (newPosition: SetStateAction<number>) => {
    if (socket) {
      if (socket.connected) {
        try {
          await socket.emitWithAck(
            "move_left_paddle",
            newPosition,
          );
        } catch (e) {
          console.log(e); //TODO: make some king of popUp
        }
      } else console.log("Socket offline");
    }
	}, []);

	const movePaddleRight = useCallback(async (newPosition: SetStateAction<number>) => {
		if (socket) {
      if (socket.connected) {
        try {
          await socket.emitWithAck(
            "move_right_paddle",
            newPosition,
          );
        } catch (e) {
          console.log(e); //TODO: make some king of popUp
        }
      } else console.log("Socket offline");
    }
	}, []);

	return (
    <GameContext.Provider value={{gameOver: gameOver}}>
		<Box
			position={'relative'}
			w={'47%'}
			h={'56%'}
			border={'2px solid white'}
			borderTop={'2px solid white'}
			borderBottom={'2px solid white'}
			borderLeft={'0px'}
			borderRight={'0px'}
		>
			<Score side={{ left: '30%', }} counter={leftScore} />
			<Score side={{ right: '30%', }} counter={rightScore} />

			<Paddle
				position={leftPaddlePosition}
				player='left'
				movePaddle={movePaddleLeft}
				side={{ left: '1.6%', }}
				color='blue'
			/>

			<DashedLineSeparator />

			<Ball
				scorePointForLeftPlayer={scorePointForLeftPlayer}
				scorePointForRightPlayer={scorePointForRightPlayer}
				paddlePositionLeft={leftPaddlePosition}
				paddlePositionRight={rightPaddlePosition}
			/>

			<Paddle
				position={rightPaddlePosition}
				player='right'
				movePaddle={movePaddleRight}
				side={{ right: '1.6%', }}
				color='red'
			/>
			{/* {gameOver && <h2>{winner} is the winner!</h2>} */}
		</Box>
    </GameContext.Provider>
	);
}
