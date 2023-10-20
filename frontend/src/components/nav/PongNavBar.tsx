'use client'
import { PropsWithChildren, useEffect, useState } from 'react';
import { Flex, Container, Image, Center, Button, Heading, Highlight, Text, HStack, Box, Icon, Avatar, Wrap, VisuallyHidden, useBreakpointValue, LinkBox, LinkOverlay, useBreakpoint } from '@chakra-ui/react';
import {
	Popover,
	PopoverTrigger,
	PopoverContent,
	PopoverHeader,
	PopoverBody,
	PopoverFooter,
	PopoverArrow,
	PopoverCloseButton,
	PopoverAnchor,
} from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { Grid, GridItem } from '@chakra-ui/react';
import {
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
	MenuItemOption,
	MenuGroup,
	MenuOptionGroup,
	MenuDivider,
} from '@chakra-ui/react'
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

const availableRoutes: Array<PongMenuItemProps> = [
	{
		text: 'Dashboard',
		route: '/dashboard'
	},
	{
		text: 'Game',
		route: '/game'
	},
	{
		text: 'Chat',
		route: '/chat'
	},
	{
		text: 'History',
		route: '/history'
	},
	{
		text: 'Rank',
		route: '/rank'
	},
];

interface PongMenuItemProps {
	route: '/dashboard' | '/game' | '/chat' | '/history' | '/rank',
	text: 'Dashboard' | 'Game' | 'Chat' | 'History' | 'Rank'
}
function PongMenuItem(props: React.PropsWithoutRef<PongMenuItemProps>): JSX.Element {
	const { text, route } = props;
	const router = useRouter();

	function goTo() {
		router.push(route)
	}
	return (
		<MenuItem onClick={goTo}>
			{text}
		</MenuItem>
	)
}

const DynamicNavBar = dynamic(() => Promise.resolve(PongNavBar), { ssr: false });
export default DynamicNavBar;

function PongNavBar(props: React.PropsWithChildren): JSX.Element {

	const router = useRouter();
	const [isWide, setIsWide] = useState(window.innerWidth > 770);


	useEffect(() => {
		function updateWid() {
			setIsWide(window.innerWidth > 770)
		}
		window.addEventListener('resize', updateWid);
		return (() => {
			window.removeEventListener('resize', updateWid)
		});
	}, [])
	return <Flex direction='row' justify='space-between'>
		<Center pl='2vw'>
			<Menu>
				<MenuButton borderColor='pongBlue.500' borderWidth='2px' borderRadius='lg' minW='10vw' color='pongBlue.500'>
					<Container>
						<ChevronDownIcon color='pongBlue.500' boxSize='3vh' />
					</Container>
				</MenuButton>
				<MenuList>
					{availableRoutes.filter(e => e.route !== router.route).map((e, i) => <PongMenuItem text={e.text} route={e.route} key={`nav-${i}`} />)}
				</MenuList>
			</Menu>
		</Center>
		<Image src='logopong_login.png' alt='pong logo' maxH='10vh' p='1vh 1vw' fit='contain' />
		<Popover gutter={0} isLazy>
			<PopoverTrigger>
				<Flex alignItems='center' justify='space-around' as='button'>
					{isWide ? <Heading color='pongBlue.500' size='sm' fontWeight='medium'>User Name</Heading> : undefined}
					{isWide ? <Box w='2vw'></Box> : undefined}
					<Avatar bg='pongBlue.500' />
					<Box w='2vw'></Box>
				</Flex>
			</PopoverTrigger>
			<PopoverContent pt='2vh'>
				<PopoverArrow />
				<PopoverCloseButton />
				<PopoverBody>
					<Container _hover={{ bg: 'gray.600' }}>
						<LinkBox>
							<LinkOverlay href='/account' >
								<Text>Account</Text>
							</LinkOverlay>
						</LinkBox>
					</Container>
					<Container _hover={{ bg: 'gray.600' }}>
						Logout
					</Container>
				</PopoverBody>
			</PopoverContent>
		</Popover>
	</Flex>;
}
