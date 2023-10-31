import { PropsWithChildren, useState, useRef, useEffect } from 'react';
import { Flex, Container, Image, Stack, Text, Progress, Collapse, Button } from '@chakra-ui/react';
import { PinInput, PinInputField } from '@chakra-ui/react'
import sendOTP from '@/lib/fetchers/sendOTP';
import { clearToken, storeToken } from "@/lib/TokenMagagment";
import { useRouter } from 'next/router';

export default function TwoFaPage(props: PropsWithChildren) {
	const [pin, setPin] = useState<string>('');
	const [user, setUser] = useState<string>('');
	const [tryCount, setTryCount] = useState(0);
	const [loading, setLoading] = useState(false);
	const pinRef = useRef<HTMLInputElement>(null);
	const btnRef = useRef<HTMLButtonElement>(null);
	const router = useRouter();

	const sendPin = async () => {
		setLoading(true);
		const confyTimer = 1000;
		try {
			const accessToken = await sendOTP(pin, user);
			storeToken(accessToken, localStorage);
			setTimeout(() => {
				router.push('/dashboard')
			}, confyTimer);
			return
		} catch (e) {
			if (tryCount > 1) {
				clearToken(localStorage);
				setTimeout(() => {
					setLoading(false);
					router.push('/');
				}, confyTimer);
				return;
			}
			if (pinRef.current)
				setTryCount((prev) => prev + 1);
			setLoading(false)
			setPin('')
		}
	}

	useEffect(() => {
		setUser(localStorage.getItem('username') ?? '')
		if (pin === '') {
			if (pinRef.current !== null)
				pinRef.current.focus();
		}
	}, [pin])
	return (
		<Flex dir='column' justify='center' align='center' h='100vh' bg='#030254' >
			<Container>
				<Flex justify='center' mb='5vh'>
					<Image src='logopong_login.png' alt='pong logo' />
				</Flex>
				<Stack>
					<Text color='orange' textAlign='center' fontSize='2xl'>Enter your code, soab </Text>
					<Text color='orange' textAlign='center' fontSize='2xl'>(tries left : {3 - tryCount})</Text>
					<Flex justify='space-around' mt='1vh'>
						<PinInput
							type='number'
							colorScheme='yellow.300'
							size='lg'
							focusBorderColor='gray.500'
							otp
							value={pin}
							onChange={setPin}
							isDisabled={loading}
							onComplete={
								() => {
									setTimeout(() => {
										if (btnRef.current)
											btnRef.current.focus()
									}, 100)
								}
							}
						>
							<PinInputField ref={pinRef} borderColor='orange.500' borderRadius='50%' borderWidth='2px' color='orange.500' fontWeight='extrabold' fontSize='xl'></PinInputField>
							<PinInputField borderColor='orange.500' borderRadius='50%' borderWidth='2px' color='orange.500' fontWeight='extrabold' fontSize='xl'></PinInputField>
							<PinInputField borderColor='orange.500' borderRadius='50%' borderWidth='2px' color='orange.500' fontWeight='extrabold' fontSize='xl'></PinInputField>
							<PinInputField borderColor='orange.500' borderRadius='50%' borderWidth='2px' color='orange.500' fontWeight='extrabold' fontSize='xl'></PinInputField>
							<PinInputField borderColor='orange.500' borderRadius='50%' borderWidth='2px' color='orange.500' fontWeight='extrabold' fontSize='xl'></PinInputField>
							<PinInputField borderColor='orange.500' borderRadius='50%' borderWidth='2px' color='orange.500' fontWeight='extrabold' fontSize='xl'></PinInputField>
						</PinInput>
					</Flex>
					<Button w='100%' onClick={sendPin} isDisabled={pin.length < 6} isLoading={loading} ref={btnRef}>Send</Button>
					<Collapse in={loading}>
						<Progress isIndeterminate />
					</Collapse>
				</Stack>
			</Container >
		</Flex >
	)
}