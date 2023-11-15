import PageLayout from "@/components/pageLayout/PageLayout";
import {
	ChannelData,
	MyChannels,
	createChannel,
	createChannelParams,
	fetchMyChannels,
	messageResponseSchema,
} from "@/lib/fetchers/chat";
import chatSocket from "@/lib/sockets/chatSocket";
import { AddIcon, RepeatIcon } from "@chakra-ui/icons";
import {
	Box,
	Button,
	ButtonGroup,
	Center,
	Circle,
	Collapse,
	Flex,
	Heading,
	IconButton,
	Input,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	Skeleton,
	Stack,
	Switch,
	Text,
	useDisclosure,
} from "@chakra-ui/react";
import { ReactElement, useCallback, useEffect, useState } from "react";

import { ChannelCard } from "../../components/pageComponents/chat/ChannelCard";
import { Socket } from "socket.io-client";
import MessageSection from "../../components/pageComponents/chat/MessageSection";


export type userSchema = {
	nickname: string;
	avatar: string;
	intra_login: string;
	status: string;
};

export type ChannelComponentProps = ChannelData & {
	onClick?: () => void;
	socket?: Socket;
	lastMessage?: string;
};

type Message = {
	id: string;
	channel_id: number;
	user_id: string;
	message: string;
	time: Date;
};

export type MessageCardProps = Message & {
	me: string;
};

export function MessageCard(props: MessageCardProps): JSX.Element {
	let thirdPartMsg = props.user_id !== props.me;

	return (
		<Flex flexDir={thirdPartMsg ? "row" : "row-reverse"}>
			<Box
				bg={thirdPartMsg ? "gray.200" : "yellow.400"}
				minW={"40%"}
				maxW={"70%"}
				borderRadius={10}
				p="1vh 1vw"
			>
				<Text color="black" textAlign={thirdPartMsg ? "start" : "end"}>
					{props.time.toLocaleDateString()}{" "}
					{props.time.toTimeString().slice(0, 8)}
				</Text>
				<Text color="black" textAlign={thirdPartMsg ? "start" : "end"}>
					{props.user_id}:
				</Text>
				<Text color="black">{props.message}</Text>
			</Box>
		</Flex>
	);
}

const dummyFriends = [
	{
		nickname: "JohnDoe",
		avatar: "",
		intra_login: "johndoe123",
		status: "active",
		elo: 1500,
	},
	{
		nickname: "JaneSmith",
		avatar: "",
		intra_login: "janesmith456",
		status: "inactive",
		elo: 1400,
	},
	{
		nickname: "MaxPayne",
		avatar: "",
		intra_login: "maxpayne789",
		status: "active",
		elo: 1600,
	},
];

export default function Chat(props: any) {
	const [online, setOnline] = useState(false);
	// const [activeChannel, setActiveChannel] = useState<undefined | ChannelComponentProps>(undefined);
	const [activeChannel, setActiveChannel] = useState<number>(-1);
	const [myChannels, setMyChannels] = useState<ChannelComponentProps[]>([]);
	const [groupName, setGroupName] = useState('');
	const [groupPsw, setGroupPsw] = useState('');
	const [loading, setLoading] = useState(false);

	const { onOpen, onClose, isOpen } = useDisclosure();

	function onConnect() {
		setOnline(true);
	}

	function onDisconnect() {
		setOnline(false);
	}

	const onServerMessage = useCallback((data: any) => {
		const message = messageResponseSchema.element.parse(data);
		if (activeChannel > -1) {
			if (message.channel_id !== myChannels[activeChannel].channelId) {
				const tempChannels: ChannelComponentProps[] = [];
				myChannels.forEach((e) => tempChannels.push({ ...e }));
				let targetChannel = tempChannels.find(
					(e) => e.channelId === message.channel_id
				);
				if (targetChannel) {
					targetChannel.lastMessage = message.message;
					setMyChannels(tempChannels); //TODO validate
				}
			}
		}
	}, [activeChannel, myChannels])

	async function createNewChannel() {
		const newChannel: createChannelParams = {
			name: groupName,
			password: groupPsw,
			protected: Boolean(groupPsw),
			type: 'public',
			user2user: false,
			members: [],
		}
		setLoading(true);
		try {
			await createChannel(newChannel);
			setGroupName('');
			setGroupPsw('');
			await updateChannelCards();
			onClose();
		} catch (e) {
			console.warn('Could not create channel');
		}
		setLoading(false);
	}
	async function updateChannelCards() {
		try {
			let response = await fetchMyChannels();
			setMyChannels(response)
		} catch (e) {
			setMyChannels([])
		}
	}
	useEffect(() => {
		fetchMyChannels().then(e => setMyChannels(e)).catch(() => setMyChannels([]));
		chatSocket.on("connect", onConnect);
		chatSocket.on("disconnect", onDisconnect);
		chatSocket.connect();

		return () => {
			chatSocket.off("connect", onConnect);
			chatSocket.off("disconnect", onDisconnect);
			chatSocket.disconnect();
		};
	}, []);
	useEffect(() => {
		chatSocket.on("server_message", onServerMessage);
		return () => {
			chatSocket.off("server_message", onServerMessage);
		}
	}, [onServerMessage])
	return (
		<Flex h="100%" alignItems={"stretch"}>
			<Flex
				flexDir={"column"}
				minW={"20vw"}
				bg="pongBlue.200"
				pt="1vh"
				pl="1vw"
				pr="1vw"
				overflowY="auto"
			>
				<Flex
					justifyContent={"space-between"}
					align={"center"}
					mb="1vh"
					borderRadius={5}
				>
					<Flex>
						<Circle
							bg={online ? "green.300" : "gray.300"}
							size="2vh"
							mr="1vw"
						/>
						<Text fontWeight={"bold"} letterSpacing={"widest"} color="white">
							{online ? "Online" : "Offiline"}
						</Text>
					</Flex>
					<IconButton
						size='sm'
						aria-label="create new group"
						colorScheme="green"
						icon={<AddIcon />}
						onClick={onOpen} />
				</Flex>

				<Collapse
					endingHeight='50vh'
					startingHeight={0}
					in={isOpen}>
					<Flex bg='pongBlue.500' borderRadius={5} flexDir={'column'} p='1vh 1vw'>
						<Heading color='gray.300' as='h6' size='xs'>Channel Name:</Heading>
						<Input size='sm' ml='10%' w='90%' placeholder="Group name" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
						<Heading pt='1vh' color='gray.300' as='h6' size='xs'>Password:</Heading>
						<Input size='sm' ml='10%' w='90%' placeholder="Password (optional)" value={groupPsw} onChange={(e => setGroupPsw(e.target.value))} />
						<Flex justify={'space-around'} pb='1vh' pt='1vh'>
							<Button
								size='md'
								colorScheme="green"
								isDisabled={(!Boolean(groupName)) || loading}
								onClick={createNewChannel}
							>Confirm</Button>
							<Button
								size='md'
								colorScheme="yellow"
								onClick={() => { setGroupName(''); setGroupPsw(''); onClose() }}
							>Cancel</Button>
						</Flex>
					</Flex>
				</Collapse>
				<Stack overflow={"auto"}>
					{myChannels.map((e, i) => (
						<ChannelCard
							key={`ChannelCard-${e.channelId}`}
							{...e}
							onClick={() => setActiveChannel(i)}
							active={i === activeChannel}
						/>
					))}
				</Stack>
			</Flex>
			<Flex flexDir="column" justifyContent="space-between" w="100%">
				{activeChannel >= 0 ? (
					<MessageSection {...myChannels[activeChannel]} socket={chatSocket} />
				) : (
					<Skeleton
						isLoaded={false}
						h="100%"
						speed={3}
						startColor="pongBlue.400"
						endColor="yellow.300"
					/>
				)}
			</Flex>
		</Flex >
	);
}

Chat.getLayout = function getLayoutPage(page: ReactElement) {
	return <PageLayout>{page}</PageLayout>;
};
