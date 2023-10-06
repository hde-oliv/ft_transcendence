import { Flex, Container, Stack, Text, Image, Progress, useToast } from "@chakra-ui/react"
import { Toast } from "@chakra-ui/react"
import axios, { AxiosRequestConfig } from "axios";
import { useRouter } from "next/router";
import { useEffect } from "react"
import { z, ZodError } from 'zod';

const loginResponse = z.object({
	access_token: z.string()
})

export default function Login() {

	const router = useRouter();
	const toast = useToast();

	async function sendCode() {
		console.log('sending code to backend');
		let parsedResp: string = '';
		try {
			const code = router.query.code;
			const config: AxiosRequestConfig = {
				headers: {
					"Content-Type": "application/json"
				}
			}
			console.log(code)
			const response = await axios.post('http://localhost:3000/auth/login', { "token": code }, {
				headers: {
					'Content-Type': 'application/json',
				}
			})
			parsedResp = loginResponse.parse(response.data).access_token;

		} catch (e) {
			if (e instanceof ZodError)
				console.log('Failed to fetch access token');
		}
		return parsedResp
	}

	useEffect(() => {
		console.log('render fired')
		if (router.query.code) {
			(async () => {
				console.log('router_query_code found');
				const localToken = await sendCode();
				if (localToken !== '') {
					localStorage.setItem('token', localToken);
					// router.push('/dashboard');
					const totalTime = 5000;
					const redirector = setTimeout(() => {
						router.push('/dashboard')
					}, totalTime);
					toast({
						title: "Login Failed",
						description: 'Redirecting to dashboard',
						status: "success",
						isClosable: true,
						duration: totalTime - 1000,
						onCloseComplete: () => {
							clearTimeout(redirector);
							router.push('/dashboard')
						}
					})
				} else {
					const totalTime = 5000;
					const redirector = setTimeout(() => {
						router.push('/')
					}, totalTime);
					toast({
						title: "Login Failed",
						description: 'Redirecting to home',
						status: "error",
						isClosable: true,
						duration: totalTime - 1000,
						onCloseComplete: () => {
							clearTimeout(redirector);
							router.push('/')
						}
					})
				}
			})()
		}
	}, [router.query.code]) //for some reason, this this dependency is necessary
	return (
		<Flex dir='column' justify='center' align='center' h='100vh' bg='#030254' >
			<Container>
				<Flex justify='center' mb='20vh' >
					<Image src='logopong_login.png' alt='pong logo' />
				</Flex>
				<Stack>
					<Progress isIndeterminate />
				</Stack>
			</Container >
		</Flex >
	)
}