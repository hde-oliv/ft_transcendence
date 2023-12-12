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

export default function PingPongTable() {
  const [scoreLeft, setScoreLeft] = useState(0);
	const [scoreRight, setScoreRight] = useState(0);
	const [paddlePositionLeft, setPaddlePositionLeft] = useState(50);
	const [paddlePositionRight, setPaddlePositionRight] = useState(50);
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
    socket.on('move_left_paddle', setPaddlePositionLeft);
    socket.on('move_right_paddle', setPaddlePositionRight);
    return () => {
      socket.off('move_left_paddle', setPaddlePositionLeft);
      socket.off('move_right_paddle', setPaddlePositionRight);
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (scoreLeft === 5 || scoreRight === 5) {
      setGameOver(true);
      if (scoreLeft === 10)
        setWinner('Left player');
      else
        setWinner('Right player');
    }
  }, [scoreLeft, scoreRight])

	const scorePointForLeftPlayer = useCallback(() => {
		setScoreLeft(scoreLeft + 1);
	}, [scoreLeft]);

	const scorePointForRightPlayer = useCallback(() => {
		setScoreRight(scoreRight + 1);
	}, [scoreRight]);

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
			<Score side={{ left: '30%', }} counter={scoreLeft} />
			<Score side={{ right: '30%', }} counter={scoreRight} />

			<Paddle
				position={paddlePositionLeft}
				player='left'
				movePaddle={movePaddleLeft}
				side={{ left: '1.6%', }}
				color='blue'
			/>

			<DashedLineSeparator />

			<Ball
				scorePointForLeftPlayer={scorePointForLeftPlayer}
				scorePointForRightPlayer={scorePointForRightPlayer}
				paddlePositionLeft={paddlePositionLeft}
				paddlePositionRight={paddlePositionRight}
			/>

			<Paddle
				position={paddlePositionRight}
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
