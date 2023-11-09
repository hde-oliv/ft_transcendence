import PageLayout from "@/components/pageLayout/PageLayout";
import { ChannelData, MyChannels, fetchMyChannels } from "@/lib/fetchers/chat";
import chatSocket from "@/lib/sockets/chatSocket";
import { EmailIcon, RepeatIcon } from "@chakra-ui/icons";
import { Box, Button, Center, Flex, IconButton, Input, InputGroup, InputRightAddon, Skeleton, Stack, Switch, Text } from "@chakra-ui/react";
import { ReactElement, useEffect, useState } from "react";
import { myChannel } from "@/lib/fetchers/chat";
import { fetchUserById } from "@/lib/fetchers/users";
import { ChannelCard } from "./ChannelCard";

export type userSchema = {
	nickname: string,
	avatar: string,
	intra_login: string,
	status: string,
}

export type ChannelComponentProps = ChannelData & {
	onClick?: () => void
	lastMessage?: string
};

type Message = {
	id: string,
	channel_id: number,
	user_id: string,
	message: string,
	time: Date
}
type MessageCardProps = Message & {
	me: string
}

function MessageCard(props: MessageCardProps): JSX.Element {
	let thirdPartMsg = props.user_id !== props.me;

	return (
		<Flex
			flexDir={thirdPartMsg ? 'row' : 'row-reverse'}
		>
			<Box bg={thirdPartMsg ? 'gray.200' : 'yellow.400'} minW={'40%'} maxW={'70%'} borderRadius={10} p='1vh 1vw'>
				<Text color='black' textAlign={thirdPartMsg ? 'start' : 'end'}>{props.time.toLocaleDateString()} {props.time.toTimeString().slice(0, 8)}</Text>
				<Text color='black' textAlign={thirdPartMsg ? 'start' : 'end'}>{props.user_id}:</Text>
				<Text color='black'>{props.message}</Text>
			</Box>
		</Flex>
	)
}

function MessageSection(props: ChannelComponentProps): JSX.Element {
	const [messages, setMessages] = useState<Array<MessageCardProps>>([]);

	useEffect(() => {
		setMessages([
			{
				id: "baaf8ba7-ad95-4913-aad1-53bbcee4ba7e",
				channel_id: 15,
				user_id: "hde-camp",
				message: "teste",
				time: new Date("2023-11-07T00:32:41.867Z"),
				me: "hde-camp"
			},
			{
				id: "baaf8ba7-ad95-4913-aad1-53bbcee4ba7f",
				channel_id: 15,
				user_id: "hde-oliv",
				message: "teste",
				time: new Date("2023-11-07T00:35:41.867Z"),
				me: "hde-camp"
			}
		])
	}, [])
	return (
		<>
			<Box flexGrow={1} bg='pongBlue' overflowY='auto'>
				<Stack p='1vh 2vw'>
					{messages.map(m => <MessageCard {...m} key={`${m.id}`} />)}
				</Stack>
			</Box>
			<Box flexGrow={0} bg='pongBlue.300' pl='2vw' pr='2vw' pt='1vh' pb='1vh'>
				<InputGroup bg='pongBlue.500'>
					<Input />
					<InputRightAddon>
						<EmailIcon />
					</InputRightAddon>
				</InputGroup>
			</Box>
		</>
	)
}

const dummyFriends = [
	{
		nickname: 'JohnDoe',
		avatar: '',
		intra_login: 'johndoe123',
		status: 'active',
		elo: 1500,
	},
	{
		nickname: 'JaneSmith',
		avatar: '',
		intra_login: 'janesmith456',
		status: 'inactive',
		elo: 1400,
	},
	{
		nickname: 'MaxPayne',
		avatar: '',
		intra_login: 'maxpayne789',
		status: 'active',
		elo: 1600,
	}
];

export default function Chat(props: any) {
	const [online, setOnline] = useState(false);
	const [activeChannel, setActiveChannel] = useState<undefined | ChannelComponentProps>(undefined);
	const [myChannels, setMyChannels] = useState<MyChannels>([])

	/**
	 * {
		"id": "baaf8ba7-ad95-4913-aad1-53bbcee4ba7e",
		"channel_id": 15,
		"user_id": "hde-camp",
		"message": "teste",
		"time": "2023-11-07T00:32:41.867Z"
	},
	 */

	function onConnect() {
		setOnline(true);
	}

	function onDisconnect() {
		setOnline(false);
	}
	useEffect(() => {
		fetchMyChannels().then((e) => {
			setMyChannels(e);
		}).catch(() => setMyChannels([]));


		chatSocket.on("connect", onConnect);
		chatSocket.on("disconnect", onDisconnect);

		return () => {
			chatSocket.off("connect", onConnect);
			chatSocket.off("disconnect", onDisconnect);
		};
	}, []);
	return (
		<Flex h='100%' alignItems={'stretch'}>
			<Flex
				flexDir={'column'}
				minW={'20vw'}
				bg='pongBlue.200'
				pt='1vh'
				pl='1vw'
				pr='1vw'
				overflowY='auto'
			>
				<Flex
					justifyContent={'space-between'}
					align={'center'}

					pr='1vw'
					mb='1vh'
					h='10vh'
					borderRadius={5}
				>
					<Button
						colorScheme="green"
						aria-label="connect"
						leftIcon={<RepeatIcon />}
						onClick={() => {
							chatSocket.connected ? chatSocket.disconnect() : chatSocket.connect()
						}}
					>
						{online ? 'Disconnect' : 'Connect'}
					</Button>
					<Switch
						isReadOnly={true}
						isChecked={online}
						colorScheme={'green'}
						size='lg'
					/>
				</Flex>
				<Stack overflow={'auto'}>
					{/* {channelList.map(c => <ChannelCard {...c} key={`ChannelCard-${c.channelId}`} onClick={() => setActiveChannel(c)} />)} */}
					{myChannels.map(e => <ChannelCard key={`ChannelCard-${e.channelId}`} {...e} onClick={() => setActiveChannel(e)} />)}
				</Stack>

			</Flex>
			<Flex
				flexDir='column'
				justifyContent='space-between'
				w='100%'
			>
				{activeChannel ? <MessageSection {...activeChannel} /> : <Skeleton isLoaded={false} h='100%' speed={3} startColor="pongBlue.400" endColor="yellow.300" />}
			</Flex>
		</Flex>

	)
}

Chat.getLayout = function getLayoutPage(page: ReactElement) {
	return (
		<PageLayout>
			{page}
		</PageLayout>
	)
}


