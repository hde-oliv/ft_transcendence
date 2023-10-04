'use client'
import { Image, Box, Button, Container, Flex, Stack } from "@chakra-ui/react";
import useSWR from 'swr';
import axios, { AxiosRequestConfig } from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import z, { ZodError } from 'zod';

const authResponseData = z.object({
	access_token: z.string(),
	token_type: z.string().startsWith('bearer').length(6),
	expires_in: z.number().int(),
	scope: z.string().startsWith("public").length(6),
	created_at: z.number().int(),
	secret_valid_until: z.number().int()
})

export default function Home() {
	const [token, setToken] = useState<string | undefined>(undefined);

	const router = useRouter();
	function logIn42_redirect() {
		const authURL = `https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-fb85b86a0af8ab2f7f127ad1616f6d3125fd4f84c7e8e5a679b9fe5a51821265&redirect_uri=http%3A%2F%2Flocalhost%3A3001&response_type=code`;
		window.location.href = authURL;

	}
	async function exchangeCode() {
		try {
			const code = router.query.code;
			if (!code) {
				window.alert('No code available');
				return;
			}
			const response = await axios.post('https://api.intra.42.fr/oauth/token', {
				"grant_type": "authorization_code",
				"client_id": "u-s4t2ud-fb85b86a0af8ab2f7f127ad1616f6d3125fd4f84c7e8e5a679b9fe5a51821265",
				"client_secret": "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",
				"code": code,
				"redirect_uri": "http://localhost:3001"
			})
			const data = authResponseData.parse(response.data);
			setToken(data.access_token);
			return response.data;
		} catch (e) {
			if (e instanceof ZodError)
				console.log('Failed to fetch access token');
			if (e instanceof Error)
				window.alert(e.message)
		}
	}

	async function getDataFrom42() {
		try {
			const config: AxiosRequestConfig = {
				headers: {
					Authorization: `Bearer ${token}`
				}
			}
			console.log(config);
			const response = await axios.get('https://api.intra.42.fr/v2/me', config)
			// const response = await axios.get('https://api.intra.42.fr/oauth/token/info', config)
		} catch (e) {
			if (e instanceof Error)
				console.log(e);
		}
	}
	return (
		<Flex dir='column' justify='center' align='center' h='100vh' bg='#030254' >
			<Container>
				<Flex justify='center' mb='20vh' >
					<Image src='logopong_login.png' alt='pong logo' />
				</Flex>
				<Stack>
					<Button colorScheme="yellow" variant='outline' size='lg' onClick={logIn42_redirect}>LogIn 42</Button>
					<Button onClick={exchangeCode} isDisabled={router.query.code === undefined}>Send</Button>
					<Button onClick={getDataFrom42} isDisabled={token === undefined}>Get42Data</Button>
				</Stack>
			</Container >
		</Flex >
	);
}
