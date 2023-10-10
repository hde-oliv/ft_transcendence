import { PropsWithChildren } from 'react';
import { Flex, Container, Image, Stack, Button, Heading, Highlight, Text, HStack } from '@chakra-ui/react';
import { PinInput, PinInputField } from '@chakra-ui/react'

export default function Dashboard(props: PropsWithChildren) {
	return (
		<Flex dir='column' justify='center' align='center' h='100vh' bg='#030254' >
			<Container>
				<Flex justify='center' mb='5vh'>
					<Image src='logopong_login.png' alt='pong logo' />
				</Flex>
				<Stack>
					<Text color='orange' textAlign='center' fontSize='2xl'>Enter your code, soab</Text>
					<Flex justify='space-around' mt='1vh'>
						<PinInput type='number' colorScheme='orange.500' size='lg' focusBorderColor='yellow.500'>
							<PinInputField borderColor='orange.500' borderRadius='50%' borderWidth='2px' color='orange.500' fontWeight='extrabold' fontSize='xl'></PinInputField>
							<PinInputField borderColor='orange.500' borderRadius='50%' borderWidth='2px' color='orange.500' fontWeight='extrabold' fontSize='xl'></PinInputField>
							<PinInputField borderColor='orange.500' borderRadius='50%' borderWidth='2px' color='orange.500' fontWeight='extrabold' fontSize='xl'></PinInputField>
							<PinInputField borderColor='orange.500' borderRadius='50%' borderWidth='2px' color='orange.500' fontWeight='extrabold' fontSize='xl'></PinInputField>
							<PinInputField borderColor='orange.500' borderRadius='50%' borderWidth='2px' color='orange.500' fontWeight='extrabold' fontSize='xl'></PinInputField>
							<PinInputField borderColor='orange.500' borderRadius='50%' borderWidth='2px' color='orange.500' fontWeight='extrabold' fontSize='xl'></PinInputField>
							<PinInputField borderColor='orange.500' borderRadius='50%' borderWidth='2px' color='orange.500' fontWeight='extrabold' fontSize='xl'></PinInputField>
						</PinInput>
					</Flex>
				</Stack>
			</Container >
		</Flex >
	)
}