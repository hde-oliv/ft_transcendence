'use client'
import PingPongTable from "@/components/game/PingPongTable";
import { Box } from "@chakra-ui/react";

export default function Game() {
	return (
		<Box className="App"
			display={'flex'}
			justifyContent={'center'}
			alignItems={'center'}
			h='100vh'
			backgroundColor={'#282c34'}
			border='1px'
			borderColor='blue'
		>
			<PingPongTable />
		</Box>
	);
}
