'use client'
import { Image, Box, Button, Container, Flex, Stack, Text } from "@chakra-ui/react";
import axios, { AxiosRequestConfig } from "axios";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";




export default function Home() {
	const [token, setToken] = useState<string | undefined>(undefined);
	const [loadingRedir, setLoadingRedir] = useState(false);
	const [loadingToken, setLoadingToken] = useState(false);


	const router = useRouter();
	const getRef = useRef(false);
	async function logIn42_redirect() {
		const authURL = `https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-fb85b86a0af8ab2f7f127ad1616f6d3125fd4f84c7e8e5a679b9fe5a51821265&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fcallback&response_type=code`;
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
