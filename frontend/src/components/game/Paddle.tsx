import { Box } from "@chakra-ui/react";
import { useEffect } from "react";

interface PaddleProps {
	position: number;
	movePaddle: (newPosition: number) => void;
	player: string;
	side: { left?: string, right?: string };
	color: string;
}

export default function Paddle({ position, movePaddle, player, side, color }: Readonly<PaddleProps>) {
	const paddlePosition = position;

	useEffect(() => {

		const handleKeyDown = (event: KeyboardEvent) => {
		  switch (event.key) {
			case 'w':
				movePaddle(Math.max(paddlePosition - 5, 9));
			  break;
			case 's':
				movePaddle(Math.min(paddlePosition + 5, 91));
			  break;
			default:
			  break;
		  }
		};

		const handleKeyUp = (event: KeyboardEvent) => {
			switch (event.key) {
			  case 'ArrowUp':
				movePaddle(Math.max(paddlePosition - 5, 9));
				break;
			  case 'ArrowDown':
				movePaddle(Math.min(paddlePosition + 5, 91));
				break;
			  default:
				break;
			}
		}

		if (player === 'left')
			window.addEventListener('keydown', handleKeyDown);
		else
			window.addEventListener('keydown', handleKeyUp);

		return () => {
			if (player === 'left')
				window.removeEventListener('keydown', handleKeyDown);
			else
				window.removeEventListener('keydown', handleKeyUp);
		};
	  },
	);

	return (
		<Box
			position={'absolute'}
			w={'2%'}
			h={'16%'}
			bgColor={'white'}
			{...side}
			top={paddlePosition + '%'}
			transform='translateY(-50%)'
			border={`1px solid ${color}`}
		></Box>
	);
}
