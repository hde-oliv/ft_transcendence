import { PropsWithChildren } from 'react';
import { Flex, Container, Image, Center, Button, Heading, Highlight, Text, HStack, Box, Icon, Avatar, Wrap, VisuallyHidden, useBreakpointValue } from '@chakra-ui/react';
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


export default function PongNavBar(props: React.PropsWithChildren): JSX.Element {

	const router = useRouter();
	const isWide = useBreakpointValue({ base: false, sm: true, md: true, lg: true, xl: true, '2xl': true })

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
		<Flex alignItems='center' justify='space-around'>
			{isWide ? <Heading color='pongBlue.500' size='sm'>User Name</Heading> : undefined}
			{isWide ? <Box w='2vw'></Box> : undefined}
			<Avatar bg='pongBlue.500' />
			<Box w='2vw'></Box>
		</Flex>
	</Flex>;
}
