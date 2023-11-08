import PageLayout from "@/components/pageLayout/PageLayout";
import chatSocket from "@/lib/sockets/chatSocket";
import { EmailIcon, RepeatIcon } from "@chakra-ui/icons";
import { Avatar, Box, Button, Center, Flex, Heading, IconButton, Input, InputGroup, InputRightAddon, Stack, Switch, Text } from "@chakra-ui/react";
import { ReactElement, useEffect, useState } from "react";

type userSchema = {
	nickname: string,
	avatar: string,
	intra_login: string,
	status: string,
	elo: number,
}

type FriendCardProps = userSchema & {
	lastMessage?: string
};

function FriendCard(props: FriendCardProps) {
	return (
		<Flex
			bg='pongBlue.300'
			padding='1vw 1vw'
			borderRadius='10'
			borderStyle='solid'
			borderColor='yellow.500'
			borderWidth={2}
			justifyContent='flex-start'
			maxW='20vw'
		>
			<Avatar src={props.avatar} maxW='30%' />
			<Box pr='5%' pl='5%' maxW='70%'>
				<Heading
					as='h6'
					size='xs'
					overflow='hidden'
					textOverflow='ellipsis'
				>
					{props.nickname}
				</Heading>
				<Text
					overflow='hidden'
					textOverflow='ellipsis'
					whiteSpace="nowrap"
				>
					{props.lastMessage ? props.lastMessage : ''}
				</Text>
			</Box>
		</Flex>
	);
}
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
			<Box bg={thirdPartMsg ? 'teal.600' : 'blue.400'} minW={'40%'} maxW={'70%'} borderRadius={10} p='1vh 1vw'>
				<Text textAlign={thirdPartMsg ? 'start' : 'end'}>{props.time.toLocaleDateString()} {props.time.toTimeString().slice(0, 8)}</Text>
				<Text textAlign={thirdPartMsg ? 'start' : 'end'}>{props.user_id}:</Text>
				<Text>{props.message}</Text>
			</Box>
		</Flex>
	)
}
function MessageSection(props: any): JSX.Element {
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
					{messages.map(m => <MessageCard {...m} />)}
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
	const [friendList, setFriendList] = useState<Array<userSchema>>(dummyFriends)
	/**
	 * {
		"id": "baaf8ba7-ad95-4913-aad1-53bbcee4ba7e",
		"channel_id": 15,
		"user_id": "hde-camp",
		"message": "teste",
		"time": "2023-11-07T00:32:41.867Z"
	},
	 */
	useEffect(() => {
		function onConnect() {
			setOnline(true);
		}

		function onDisconnect() {
			setOnline(false);
		}

		// function onReceiveMessage(value: Message) {
		//   console.warn(value.channel_id);
		//   console.warn(chatRef.current);

		//   if (value.channel_id === chatRef.current.chatInfo?.id) {
		// 	setLocalMessages((previous) => [...previous, value]);
		//   }
		// }

		chatSocket.on("connect", onConnect);
		chatSocket.on("disconnect", onDisconnect);
		// chatSocket.on("receive_message", onReceiveMessage);

		return () => {
			chatSocket.off("connect", onConnect);
			chatSocket.off("disconnect", onDisconnect);
			// chatSocket.off("receive_message", onReceiveMessage);
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
							chatSocket.connect()
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
					{friendList.map(f => <FriendCard {...f} />)}
				</Stack>

			</Flex>
			<Flex
				flexDir='column'
				justifyContent='space-between'
				w='100%'
			>
				<MessageSection />
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


