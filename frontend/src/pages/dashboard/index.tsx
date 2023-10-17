'use client'
import { PropsWithChildren } from 'react';
import PongPageMenu from '../../components/nav/PongNavBar'
import { Avatar, AvatarBadge, Box, Button, Card, CardBody, CardFooter, CardHeader, Center, Flex, Heading, Icon, Text, VStack, Wrap, WrapItem } from '@chakra-ui/react';
import {
	Stat,
	StatLabel,
	StatNumber,
	StatHelpText,
	StatArrow,
	StatGroup,
} from '@chakra-ui/react'
import { Grid, GridItem, Container } from '@chakra-ui/react';
import {
	Table,
	Thead,
	Tbody,
	Tfoot,
	Tr,
	Th,
	Td,
	TableCaption,
	TableContainer,
} from '@chakra-ui/react'
import { useRouter } from 'next/router';
import { CheckIcon, AddIcon } from '@chakra-ui/icons';


function PlayCard(props: PropsWithChildren) {
	return (
		<Center flexDir='column' alignItems='stretch' h='370px' w='370px' justifyContent='space-between'>
			<Button borderRadius='45' h='45%' backgroundColor='yellow.300' color='pongBlue.400' >Play now</Button>
			<Button borderRadius='45' h='45%' backgroundColor='yellow.300' color='pongBlue.400' >Challenge a friend</Button>
		</Center>
	)
}
function RankCard(props: PropsWithChildren) {
	return (
		<Center h='370px' w='370px'>
			<Stat pl='1vw'>
				<StatLabel fontSize='lg' fontWeight='bold'>Rank</StatLabel>
				<StatNumber fontSize='3xl' textAlign='center'>1</StatNumber>
				<StatHelpText textAlign='center' fontSize='md'>
					<StatArrow type='increase' />
					1
				</StatHelpText>
				<StatLabel fontSize='lg' fontWeight='bold'>Points</StatLabel>
				<StatNumber fontSize='3xl' textAlign='center'>50</StatNumber>
				<StatHelpText textAlign='center' fontSize='md'>
					<StatArrow type='increase'></StatArrow>
					50
				</StatHelpText>
			</Stat>
		</Center>
	)
}

function HistoryCard(props: PropsWithChildren) {
	//limitar historico a 5 registros
	return (
		<Center flexDir='column' h='370px' w='370px'>
			<Heading mb='1vh'>History</Heading>
			<TableContainer>
				<Table size='sm' >
					<Thead>
						<Tr bgColor='gray' >
							<Th color='yellow.300'>Won</Th>
							<Th color='yellow.300'>Date</Th>
							<Th color='yellow.300'>Adversary</Th>
							<Th color='yellow.300'>Score</Th>
						</Tr>
					</Thead>
					<Tbody>
						<Tr>
							<Td><CheckIcon /></Td>
							<Td>01/01/2010</Td>
							<Td>hde-camp</Td>
							<Td>8 | 0</Td>
						</Tr>
						<Tr>
							<Td><CheckIcon /></Td>
							<Td>01/01/2010</Td>
							<Td>hde-camp</Td>
							<Td>8 | 0</Td>
						</Tr>
						<Tr>
							<Td><CheckIcon /></Td>
							<Td>01/01/2010</Td>
							<Td>hde-camp</Td>
							<Td>8 | 0</Td>
						</Tr>
						<Tr>
							<Td><CheckIcon /></Td>
							<Td>01/01/2010</Td>
							<Td>hde-camp</Td>
							<Td>8 | 0</Td>
						</Tr>
						<Tr>
							<Td><CheckIcon /></Td>
							<Td>01/01/2010</Td>
							<Td>hde-camp</Td>
							<Td>8 | 0</Td>
						</Tr>
					</Tbody>
				</Table>
			</TableContainer>
		</Center>
	)
}
function StatsCard(props: PropsWithChildren) {
	return (
		<Center flexDir='column' h='370px' w='370px'>
			<Heading pb='2vw'>
				Stats
			</Heading>
			<Wrap spacing='1vw'>
				<Stat borderWidth='2px' borderRadius='lg' p='1vw 1vw' borderColor='yellow.200'>
					<StatLabel>Games</StatLabel>
					<StatNumber textAlign='center' color='yellow.300'>20</StatNumber>
				</Stat>
				<Stat borderWidth='2px' borderRadius='lg' p='1vw 1vw' borderColor='yellow.200'>
					<StatLabel>Victories</StatLabel>
					<StatNumber textAlign='center' color='green.400'>10</StatNumber>
				</Stat>
				<Stat borderWidth='2px' borderRadius='lg' p='1vw 1vw' borderColor='yellow.200'>
					<StatLabel>Loses</StatLabel>
					<StatNumber textAlign='center' color='red.400'>10</StatNumber>
				</Stat>
			</Wrap>
		</Center>
	)
}
function ConfigsCard(props: PropsWithChildren) {
	return (
		<Center flexDir='column' h='370px' w='370px'>
			<Heading>
				Configs
			</Heading>
		</Center>
	)
}
function ContactRow(props: PropsWithChildren & { online: boolean }) {
	const { online } = props;
	const color = online ? 'green.300' : 'gray.300'
	return (
		<Flex w='100%' pl='1vw' pr='1vw' justifyContent='space-between'>
			<Box>
				<Avatar>
					<AvatarBadge boxSize='1.25em' bg={color} />
				</Avatar>
				<Box display='inline-block'>
					<Heading fontWeight='medium' size='md' pl='1vw'>hde-camp</Heading>
					<Heading fontWeight='light' size='xs' pl='1vw'>hde-camp</Heading>
				</Box>
			</Box>
			<Box>
				<Text>21:23</Text>
			</Box>
		</Flex>
	);
}
function ChatsCard(props: PropsWithChildren) {
	return (
		<Flex flexDir='column' h='370px' w='370px' alignItems='stretch'>
			<Heading textAlign='center' pt='1vh'>Chats</Heading>
			<Button rightIcon={<AddIcon />} mb='2vh' mt='1vh' colorScheme='yellow'>Add friend</Button>
			<VStack>
				<ContactRow online={true} />
				<ContactRow online={false} />
				<ContactRow online={true} />
			</VStack>
		</Flex>
	)
}

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
			<GridItem area={'content'} bg='pongBlue.400' overflowY='auto'>
				<Wrap p='5vh 5vw' spacing='30px' justify='center'>
					<WrapItem >
						<PlayCard />
					</WrapItem>
					<WrapItem borderRadius='30' borderWidth='2px' borderColor='yellow.400'>
						<RankCard />
					</WrapItem>
					<WrapItem borderRadius='30' borderWidth='2px' borderColor='yellow.400'>
						<HistoryCard />
					</WrapItem>
					<WrapItem borderRadius='30' borderWidth='2px' borderColor='yellow.400'>
						<StatsCard />
					</WrapItem>
					<WrapItem borderRadius='30' borderWidth='2px' borderColor='yellow.400'>
						<ConfigsCard />
					</WrapItem>
					<WrapItem borderRadius='30' borderWidth='2px' borderColor='yellow.400'>
						<ChatsCard />
					</WrapItem>
				</Wrap>
			</GridItem>
		</Grid>
	)
}