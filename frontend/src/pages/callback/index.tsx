import { Flex, Container, Stack, Text, Image, Progress, useToast } from "@chakra-ui/react"
import { Toast } from "@chakra-ui/react"
import axios, { AxiosRequestConfig } from "axios";
import { useRouter } from "next/router";
import { useEffect } from "react"
import { z, ZodError } from 'zod';

const tokenPayload = z.object({
	nickname: z.string().min(1, 'User Nickname cannot be empty'),
	avatar: z.string({ required_error: 'An avatar must be provided' }),
	intra_login: z.string().min(1, '42 Intranet login cannot be empty'),
	otp_enabled: z.boolean(),
	otp_verified: z.boolean(),
	iat: z.number().int().transform(n => new Date(n * 1000)),
	exp: z.number().int().transform(n => new Date(n * 1000))
})
type tokenPayloadType = z.infer<typeof tokenPayload>;

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
			const response = await axios.post('http://localhost:3000/auth/login', { "token": code }, {
				headers: {
					'Content-Type': 'application/json',
				}
			})
			parsedResp = loginResponse.parse(response.data).access_token;
			localStorage.setItem('token', `Bearer ${parsedResp}`);
		} catch (e) {
			if (e instanceof ZodError)
				console.log('Failed to fetch access token');
		}
		return parsedResp
	}

	useEffect(() => { //TODO: add redirection for twofa when needed
		if (router.query.code) {
			(async () => {
				console.log('router_query_code found');
				const localToken = await sendCode();
				const totalTime = 2000;
				if (localToken !== '') {
					const tParts = localToken.split('.');
					const encoded = tParts[1];
					const payload = JSON.parse(atob(encoded));
					localStorage.setItem('token', localToken);
					localStorage.setItem('tokenExp', Math.floor(payload.exp * 1000).toString());
					// router.push('/dashboard');
					const redirector = setTimeout(() => {
						router.push('/dashboard')
					}, totalTime);
					toast({
						title: "Login Succeeded",
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