'use client'
import { Image, Box, Button, Container, Flex, Stack, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useRef, useState } from "react";




export default function Home() {
	const [token, setToken] = useState<string | undefined>(undefined);
	const [loadingRedir, setLoadingRedir] = useState(false);


	const router = useRouter();
	const getRef = useRef(false);
	async function logIn42_redirect() {
		const authURL = `${process.env.NEXT_PUBLIC_INTRAOAUTH}`;
		await router.push(authURL, 'login')

	}
	if (token === undefined && router.query.code && !getRef.current.valueOf()) {
		getRef.current = true;
		console.log('executou!')

	}

	return (
		<Flex dir='column' justify='center' align='center' h='100vh' bg='#030254' >
			<Container>
				<Flex justify='center' mb='20vh' >
					<Image src='logopong_login.png' alt='pong logo' />
				</Flex>
				<Stack>
					<Button colorScheme="yellow" variant='outline' size='lg' onClick={logIn42_redirect} isLoading={loadingRedir}> LogIn 42 </Button>
				</Stack>
			</Container >
		</Flex >
	);
}

