'use client'
import PingPongTable from "@/components/game/PingPongTable";
import PongNavBar from "@/components/nav/PongNavBar";
import { Box } from "@chakra-ui/react";

export default function Game() {
	return (
    <>
    <PongNavBar nickname={""} avatar={""} intra_login={""} otp_enabled={false} />
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
		</Box></>
	);
}
