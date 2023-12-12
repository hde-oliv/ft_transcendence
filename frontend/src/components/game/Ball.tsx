'use client'
import { GameContext } from "@/contexts/GameContext";
import { Box } from "@chakra-ui/react";
import { useContext, useEffect, useRef, useState } from "react";

enum RacketDirection {
	DEFAULT = 1,
	INVERTED = 2,
	STRAIGHT = 3,
}

enum YAxisDirection {
	UP = -1,
	DOWN = 1,
}

interface BallProps {
	scorePointForLeftPlayer: () => void;
	scorePointForRightPlayer: () => void;
	paddlePositionLeft: number;
	paddlePositionRight: number;
}

export default function Ball({ scorePointForLeftPlayer, scorePointForRightPlayer, paddlePositionLeft, paddlePositionRight }: BallProps) {
	const xAxisSpeed = 1.5;
	const yAxisSpeed = 1.5;
	const directCrossedBall = useRef(false);
	const yAxisDir = useRef(0);
  const gameContext = useContext(GameContext);
	const [ballPosition, setBallPosition] = useState({ x: 50, y: 50 });
	const [ballDirection, setBallDirection] = useState({
		x: Math.random() < 0.5 ? + xAxisSpeed : - xAxisSpeed,
		y: Math.random() < 0.5 ? + yAxisSpeed : - yAxisSpeed,
	});

	useEffect(() => {
		const timer = setInterval(() => {

      if (gameContext.gameOver) {
        clearInterval(timer);
        return;
      }

			// Move the ball
			setBallPosition((prevPosition) => {
				if (directCrossedBall.current)
					return {
						...prevPosition,
						x: prevPosition.x + ballDirection.x,
					}
				else
					return {
						x: prevPosition.x + ballDirection.x,
						y: prevPosition.y + ballDirection.y,
					}
			});

			// Check if the ball hits the vertical walls
			if (ballPosition.x <= 0 || ballPosition.x >= 100) {
				if (ballPosition.x <= 0) {
					scorePointForRightPlayer();
				}
				else {
					scorePointForLeftPlayer();
				}
				setBallPosition({ x: 50, y: 50 });
				setBallDirection({
					x: Math.random() < 0.5 ? + xAxisSpeed : - xAxisSpeed,
					y: Math.random() < 0.5 ? + yAxisSpeed : - yAxisSpeed,
				});
				return;
			}

			// Check if the ball hits the horizontal walls
			if (ballPosition.y <= 3.5) {
				setBallDirection((prevDirection) => ({
					...prevDirection,
					y: + yAxisSpeed,
				}));
				yAxisDir.current = YAxisDirection.DOWN;
				directCrossedBall.current = false;
			}

			if (ballPosition.y >= 96.5) {
				setBallDirection((prevDirection) => ({
					...prevDirection,
					y: - yAxisSpeed,
				}));
				yAxisDir.current = YAxisDirection.UP;
				directCrossedBall.current = false;
			}

			// Check if the ball hits the left paddle
			let biggerPos = ballPosition.y > paddlePositionLeft ? ballPosition.y : paddlePositionLeft;
			let smallerPos = ballPosition.y < paddlePositionLeft ? ballPosition.y : paddlePositionLeft;
			if (ballPosition.x <= 5 && (biggerPos - smallerPos < 10)) {
				if (ballPosition.x <= 2.5) {
					setBallDirection(() => ({
						x: - xAxisSpeed,
						y: yAxisDir.current == YAxisDirection.UP ? + ballPosition.y : - ballPosition.y,
					}));
					setBallPosition(() => ({
						x: ballPosition.x - xAxisSpeed,
						y: yAxisDir.current == YAxisDirection.UP ? + ballPosition.y : - ballPosition.y,
					}));
					setBallPosition((prevPosition) => ({
						x: prevPosition.x + ballDirection.x,
						y: prevPosition.y + ballDirection.y,
					}));
					setBallPosition((prevPosition) => ({
						x: prevPosition.x + ballDirection.x,
						y: prevPosition.y + ballDirection.y,
					}));
					return;
				}
				const racketDir: RacketDirection = Math.floor(Math.random() * 3) + 1;
				if (racketDir == RacketDirection.DEFAULT) {
					setBallDirection((prevDirection) => ({
						...prevDirection,
						x: + xAxisSpeed,
					}));
					setBallPosition((prevPosition) => ({
						...prevPosition,
						x: ballPosition.x + xAxisSpeed,
					}));
					directCrossedBall.current = false;
				}
				else if (racketDir == RacketDirection.STRAIGHT) {
					setBallDirection((prevDirection) => ({
						...prevDirection,
						x: + xAxisSpeed,
					}));
					setBallPosition((prevPosition) => ({
						...prevPosition,
						x: ballPosition.x + xAxisSpeed,
					}));
					directCrossedBall.current = true;
				}
				else {
					setBallDirection(() => ({
						x: + xAxisSpeed,
						y: yAxisDir.current == YAxisDirection.UP ? + yAxisSpeed : - yAxisSpeed,
					}));
					setBallPosition(() => ({
						x: ballPosition.x + xAxisSpeed,
						y: yAxisDir.current == YAxisDirection.UP ? ballPosition.y + yAxisSpeed : ballPosition.y - yAxisSpeed,
					}));
					directCrossedBall.current = false;
				}
			}

			// Check if the ball hits the right paddle
			let biggerPos2 = ballPosition.y > paddlePositionRight ? ballPosition.y : paddlePositionRight;
			let smallerPos2 = ballPosition.y < paddlePositionRight ? ballPosition.y : paddlePositionRight;
			if (ballPosition.x >= 95 && (biggerPos2 - smallerPos2 < 10)) {
				if (ballPosition.x >= 97.5) {
					setBallDirection(() => ({
						x: + xAxisSpeed,
						y: yAxisDir.current == YAxisDirection.UP ? + ballPosition.y : - ballPosition.y,
					}));
					setBallPosition(() => ({
						x: ballPosition.x + xAxisSpeed,
						y: yAxisDir.current == YAxisDirection.UP ? + ballPosition.y : - ballPosition.y,
					}));
					setBallPosition((prevPosition) => ({
						x: prevPosition.x + ballDirection.x,
						y: prevPosition.y + ballDirection.y,
					}));
					setBallPosition((prevPosition) => ({
						x: prevPosition.x + ballDirection.x,
						y: prevPosition.y + ballDirection.y,
					}));
					setBallPosition((prevPosition) => ({
						x: prevPosition.x + ballDirection.x,
						y: prevPosition.y + ballDirection.y,
					}));
					return;
				}
				const racketDir: RacketDirection = Math.floor(Math.random() * 3) + 1;
				if (racketDir == RacketDirection.DEFAULT) {
					setBallDirection((prevDirection) => ({
						...prevDirection,
						x: - xAxisSpeed,
					}));
					setBallPosition((prevPosition) => ({
						...prevPosition,
						x: ballPosition.x - xAxisSpeed,
					}));
					directCrossedBall.current = false;
				}
				else if (racketDir == RacketDirection.STRAIGHT) {
					setBallDirection((prevDirection) => ({
						...prevDirection,
						x: - xAxisSpeed,
					}));
					setBallPosition((prevPosition) => ({
						...prevPosition,
						x: ballPosition.x - xAxisSpeed,
					}));
					directCrossedBall.current = true;
				}
				else {
					setBallDirection(() => ({
						x: - xAxisSpeed,
						y: yAxisDir.current == YAxisDirection.UP ? + yAxisSpeed : - yAxisSpeed,
					}));
					setBallPosition(() => ({
						x: ballPosition.x - xAxisSpeed,
						y: yAxisDir.current == YAxisDirection.UP ? ballPosition.y + yAxisSpeed : ballPosition.y - yAxisSpeed,
					}));
					directCrossedBall.current = false;
				}
			}
		}, 50);

		return () => {
			clearInterval(timer);
		};
	}, [ballPosition, ballDirection]);

	return (
		<Box
			position="absolute"
			w={'1vw'}
			h={'1vw'}
			bgColor="white"
			left={`${ballPosition.x}%`}
			top={`${ballPosition.y}%`}
			transform="translate(-50%, -50%)"
		></Box>
	);
}
