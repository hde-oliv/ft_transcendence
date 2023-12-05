import { Box } from "@chakra-ui/react";
import Score from "./Score";
import Paddle from "./Paddle";
import DashedLineSeparator from "./DashedLineSeparator";
import Ball from "./Ball";
import { SetStateAction, useCallback, useState } from "react";

export default function PingPongTable() {
	const [scoreLeft, setScoreLeft] = useState(0);
	const [scoreRight, setScoreRight] = useState(0);
	const [paddlePositionLeft, setPaddlePositionLeft] = useState(50);
	const [paddlePositionRight, setPaddlePositionRight] = useState(50);

	const scorePointForLeftPlayer = useCallback(() => {
		setScoreLeft(scoreLeft + 1);
	}, [scoreLeft]);

	const scorePointForRightPlayer = useCallback(() => {
		setScoreRight(scoreRight + 1);
	}, [scoreRight]);

	const movePaddleLeft = useCallback((newPosition: SetStateAction<number>) => {
		setPaddlePositionLeft(newPosition);
	}, []);

	const movePaddleRight = useCallback((newPosition: SetStateAction<number>) => {
		setPaddlePositionRight(newPosition);
	}, []);

	return (
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
	);
}
