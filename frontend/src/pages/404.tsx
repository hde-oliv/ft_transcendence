'use client'
import { PropsWithChildren } from 'react';
import { Container, Heading } from '@chakra-ui/react';
import { Center, Image } from '@chakra-ui/react';
import { useRouter } from 'next/router';

export default function Dashboard(props: PropsWithChildren) {
	const router = useRouter();
	return (
		<Center bg='pongBlue.500' h='100vh' w='100vw'>
			<Container display='flex' flexDir='column' justifyItems='center'>
				<Image src='logopong_login.png' alt='pong logo' h='20vh' fit='contain' />
				<Center>
					<Heading size='md' color='orange.400'>Page not found</Heading>
				</Center>
			</Container>
		</Center>
	)
}