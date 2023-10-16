'use client'
import { PropsWithChildren } from 'react';
import PongPageMenu from '../../components/nav/PongNavBar'
import { Button, Card, CardBody, CardFooter, CardHeader, Center, Flex, Heading, Text, Wrap, WrapItem } from '@chakra-ui/react';
import { Grid, GridItem, Container } from '@chakra-ui/react';
import { useRouter } from 'next/router';

export default function Dashboard(props: PropsWithChildren) {
	const router = useRouter();
	return (
		<Grid
			h='100px'
			gap='0'
			templateAreas={`"nav"
							"content"`}
			gridTemplateRows={'10vh 90vh'}
			templateColumns={'100%'}
		>
			<GridItem area={'nav'} bg='yellow.300'>
				<PongPageMenu />
			</GridItem>
			<GridItem area={'content'} bg='pongBlue.400'>
				<Wrap p='5vh 5vw' spacing='30px' justify='center'>
					<WrapItem >
						<Center flexDir='column' alignItems='stretch' h='370px' w='370px' justifyContent='space-between'>
							<Button borderRadius='45' h='45%' backgroundColor='yellow.400' color='pongBlue.400' >Play now</Button>
							<Button borderRadius='45' h='45%' backgroundColor='yellow.400' color='pongBlue.400' >Challange a friend</Button>
						</Center>
					</WrapItem>
					<WrapItem borderRadius='30' borderWidth='2px' borderColor='yellow.400'>
						<Center flexDir='column' h='370px' w='370px'>
							<Heading>
								Rank
							</Heading>
						</Center>
					</WrapItem>
					<WrapItem borderRadius='30' borderWidth='2px' borderColor='yellow.400'>
						<Center flexDir='column' h='370px' w='370px'>
							<Heading>
								Historico
							</Heading>
						</Center>
					</WrapItem>
					<WrapItem borderRadius='30' borderWidth='2px' borderColor='yellow.400'>
						<Center flexDir='column' h='370px' w='370px'>
							<Heading>
								Stats
							</Heading>
						</Center>
					</WrapItem>
					<WrapItem borderRadius='30' borderWidth='2px' borderColor='yellow.400'>
						<Center flexDir='column' h='370px' w='370px'>
							<Heading>
								Configs
							</Heading>
						</Center>
					</WrapItem>
					<WrapItem borderRadius='30' borderWidth='2px' borderColor='yellow.400'>
						<Center flexDir='column' h='370px' w='370px'>
							<Heading>
								Chats
							</Heading>
						</Center>
					</WrapItem>
				</Wrap>
			</GridItem>
		</Grid>
	)
}