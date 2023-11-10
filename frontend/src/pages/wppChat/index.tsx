import PageLayout from "@/components/pageLayout/PageLayout";
import { ChannelData, MyChannels, fetchMessagesFromChannel, fetchMyChannels, messageResponseSchema } from "@/lib/fetchers/chat";
import chatSocket from "@/lib/sockets/chatSocket";
import { EmailIcon, RepeatIcon } from "@chakra-ui/icons";
import { Box, Button, Center, Flex, IconButton, Input, InputGroup, InputRightAddon, Skeleton, Stack, Switch, Text } from "@chakra-ui/react";
import { ReactElement, useEffect, useRef, useState } from "react";
import { myChannel } from "@/lib/fetchers/chat";
import { fetchUserById } from "@/lib/fetchers/users";
import { ChannelCard } from "./ChannelCard";
import { Socket } from "socket.io-client";
import { socket } from "../chat";
import { parse } from "path";

export type userSchema = {
	nickname: string,
	avatar: string,
	intra_login: string,
	status: string,
}

export type ChannelComponentProps = ChannelData & {
	onClick?: () => void
	socket?: Socket,
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
	const [text, setText] = useState('')
	const messagesRef = useRef<HTMLDivElement>(null)

	async function send() {
		if (text === '')
			return;
		const message = {
			message: text,
			channelId: props.channelId
		}
		if (props.socket) {
			if (props.socket.connected) {
				try {
					const response = await props.socket.emitWithAck('channel_message', message)
					const parsedMessage = messageResponseSchema.element.parse(response);
					const responseAsProps = {
						...parsedMessage,
						me: props.userId
					}
					const tmpMessages = [...messages, responseAsProps];
					setMessages(tmpMessages);
					setText('');
				} catch (e) {
					console.log(e); //TODO: make some king of popUp
				}
			}
			else
				console.log('Socket offline')
		}
	}
	function serverMessage(data: any) {
		const parsedData = messageResponseSchema.element.parse(data);
		if (parsedData.channel_id === props.channelId) {
			const tempMessages = [...messages, { ...parsedData, me: props.userId }];
			setMessages(tempMessages);
		}
		console.log('onServerMessage_children')
	}
	useEffect(() => {
		chatSocket.on('server_message', serverMessage)
		return () => {
			chatSocket.off('server_message', serverMessage)
		}
	})
	useEffect(() => {
		fetchMessagesFromChannel(props.channelId).then(e => {
			setMessages(e.map(e => {
				return { ...e, me: props.userId }
			}));
		}).catch()
	}, [props])
	useEffect(() => {
		if (messagesRef.current) {
			messagesRef.current.scrollTo({
				behavior: 'smooth',
				top: messagesRef.current.scrollHeight
			})
		}
	}, [messages])
	return (
		<>
			<Box flexGrow={1} bg='pongBlue' overflowY='auto' ref={messagesRef}>
				<Stack p='1vh 2vw'>
					{messages.map(m => <MessageCard {...m} key={`${m.id}`} />)}
				</Stack>
			</Box>
			<Box flexGrow={0} bg='pongBlue.300' pl='2vw' pr='2vw' pt='1vh' pb='1vh'>
				<InputGroup bg='pongBlue.500'>
					<Input
						value={text}
						onChange={(e) => setText(e.target.value)}
						onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); send() } }}
					/>
					<InputRightAddon>
						<EmailIcon onClick={send} focusable={true} />
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
	// const [activeChannel, setActiveChannel] = useState<undefined | ChannelComponentProps>(undefined);
	const [activeChannel, setActiveChannel] = useState<number>(-1);
	const [myChannels, setMyChannels] = useState<ChannelComponentProps[]>([])

	function onConnect() {
		setOnline(true);
	}

	function onDisconnect() {
		setOnline(false);
	}

	function onServerMessage(data: any) {
		const message = messageResponseSchema.element.parse(data);
		if (activeChannel > -1) {
			if (message.channel_id !== myChannels[activeChannel].channelId) {
				const tempChannels: ChannelComponentProps[] = [];
				myChannels.forEach(e => tempChannels.push({ ...e }));
				let targetChannel = tempChannels.find(e => e.channelId === message.channel_id);
				if (targetChannel) {
					targetChannel.lastMessage = message.message;
					setMyChannels(tempChannels); //TODO validate
				}

			}
		}
	}

	useEffect(() => {
		fetchMyChannels().then((e) => {
			setMyChannels(e);
		}).catch(() => setMyChannels([]));


		chatSocket.on("connect", onConnect);
		chatSocket.on("disconnect", onDisconnect);
		chatSocket.on("server_message", onServerMessage);

		return () => {
			chatSocket.off("connect", onConnect);
			chatSocket.off("disconnect", onDisconnect);
			chatSocket.off("server_message", onServerMessage);
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
					{myChannels.map((e, i) => <ChannelCard key={`ChannelCard-${e.channelId}`} {...e} onClick={() => setActiveChannel(i)} active={i === activeChannel} />)}
				</Stack>

			</Flex>
			<Flex
				flexDir='column'
				justifyContent='space-between'
				w='100%'
			>
				{activeChannel >= 0 ? <MessageSection {...(myChannels[activeChannel])} socket={chatSocket} /> : <Skeleton isLoaded={false} h='100%' speed={3} startColor="pongBlue.400" endColor="yellow.300" />}
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


