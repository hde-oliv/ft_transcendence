import {
	ChannelData,
	UpdateChannelSchemma,
	fetchMessagesFromChannel,
	messageResponseSchema,
	patchChannel,
	updateChannelSchema,
} from "@/lib/fetchers/chat";
import chatSocket from "@/lib/sockets/chatSocket";
import {
	AddIcon,
	CloseIcon,
	EmailIcon,
	LockIcon,
	PlusSquareIcon,
	SettingsIcon,
	UnlockIcon,
} from "@chakra-ui/icons";
import {
	Avatar,
	AvatarBadge,
	Box,
	Button,
	Center,
	Checkbox,
	Collapse,
	Drawer,
	DrawerBody,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerOverlay,
	Flex,
	FormControl,
	FormLabel,
	HStack,
	Heading,
	IconButton,
	Input,
	InputGroup,
	InputRightAddon,
	Select,
	Stack,
	Switch,
	Text,
	useDisclosure,
} from "@chakra-ui/react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
	ChannelComponentProps,
	MessageCardProps,
	MessageCard,
} from "../../../pages/chat";
import z, { ZodError } from "zod";
import { ReturnUserSchema, fetchUsers } from "@/lib/fetchers/users";
import { MeResponseData, getMe } from "@/lib/fetchers/me";
import diacriticalNormalize from "@/lib/diacriticalNormalize";
import { createFriendship, getAllFriends } from "@/lib/fetchers/friends";
import { getMembers } from "@/lib/fetchers/members";
import { MeStateContext } from "@/components/pageLayout/PageLayout";

function membersFromChannel(channel: ChannelData['channel']): Array<Omit<ReturnUserSchema, 'elo'>> {
	return channel.Memberships.map(e => {
		return {
			status: e.user.status,
			avatar: e.user.avatar,
			intra_login: e.user.intra_login,
			nickname: e.user.nickname,
		}
	})
}
function MemberRow(props: Omit<ReturnUserSchema, 'elo'>) {
	const color = props.status === "online" ? "green.300" : "gray.300";
	return (
		<Flex w="100%" p='1vh 1vw' justifyContent="space-between">
			<Box>
				<Avatar src={props.avatar}>
					<AvatarBadge boxSize="1.25em" bg={color} />
				</Avatar>
				<Box display="inline-block">
					<Heading fontWeight="medium" size="md" pl="1vw">
						{props.nickname}
					</Heading>
					<Heading fontWeight="light" size="xs" pl="1vw">
						{props.intra_login}
					</Heading>
				</Box>
			</Box>
		</Flex>
	);
}
function GroupSettings(props: {
	membership: Omit<ChannelComponentProps, "channel">;
	channel: ChannelData["channel"];
	syncAll: () => void;
}) {
	const { isOpen, onClose, onOpen } = useDisclosure();
	const [editingPsw, setEditinPsw] = useState(false);
	const [pswOne, setPswOne] = useState("");
	const [pswTwo, setPswTwo] = useState("");
	const [channelType, setChannelType] = useState(props.channel.type);
	const [channelName, setChannelName] = useState(props.channel.name);

	const [me, setMe] = useContext(MeStateContext);

	const members = membersFromChannel(props.channel);

	useEffect(() => {
		setPswOne("");
		setPswTwo("");
		setChannelType(props.channel.type);
		setChannelName(props.channel.name);
	}, [props.channel.id]);

	if (props.channel.user2user) return undefined; // NOTE: Holy shit

	const pswError = pswOne !== "" && pswTwo !== "" && pswOne !== pswTwo;
	const pswDone = pswOne !== "" && pswTwo !== "" && pswOne === pswTwo;
	const pswDisable = props.channel.protected && !editingPsw;
	const canSave =
		channelName !== props.channel.name ||
		channelType !== props.channel.type ||
		pswDone ||
		pswDisable;

	async function saveConfig() {
		try {
			const updatedChannelConfig = updateChannelSchema.parse({
				name: channelName,
				type: channelType,
				password: pswDone ? pswOne : "",
				protected: pswDone,
			});
			await patchChannel(props.channel.id, updatedChannelConfig);
			props.syncAll();
		} catch (e) {
			if (e instanceof ZodError)
				console.warn("Error build patchChannel object");
		}
	}

	return (
		<Center>
			<IconButton
				colorScheme="yellow"
				size="lg"
				icon={<SettingsIcon />}
				aria-label="channel settings"
				onClick={onOpen}
			/>
			<Drawer
				isOpen={isOpen}
				placement="right"
				onClose={onClose}
				size={"lg"}
				colorScheme="yellow"
			>
				<DrawerOverlay />
				<DrawerContent>
					<DrawerHeader>
						<HStack>
							<Text>Channel Settings &nbsp; </Text>
							{props.channel.protected ? <LockIcon /> : <UnlockIcon />}{" "}
						</HStack>
					</DrawerHeader>
					<DrawerBody>
						<FormLabel>Channel Name</FormLabel>
						<Input
							value={channelName}
							onChange={({ target }) => setChannelName(target.value)}
							isDisabled={!props.membership.administrator}
							key="channelNameInput"
						/>

						<FormLabel mt="2vh">Type</FormLabel>
						<Select
							isDisabled={!props.membership.administrator}
							value={channelType}
							onChange={(e) =>
								setChannelType(e.target.value as "private" | "public")
							}
							key="channelTypeSelection"
						>
							<option value="public">Public</option>
							<option value="private">Private</option>
						</Select>
						<FormLabel mt="2vh">Password</FormLabel>
						<Checkbox
							display={"block"}
							ml="2vw"
							size="lg"
							isDisabled={!props.membership.administrator}
							colorScheme="yellow"
							isChecked={editingPsw}
							onChange={(e) => {
								console.log(`value:${e.target.value}`);
								console.log(`checked:${e.target.checked}`);
								setEditinPsw(e.target.checked);
							}}
						/>
						<Collapse in={editingPsw}>
							<Flex flexDir="column">
								<Input
									isDisabled={!props.membership.administrator}
									key="pswOneInput"
									placeholder="Type the new password"
									type="password"
									isInvalid={pswError}
									value={pswOne}
									onChange={(e) => setPswOne(e.target.value)}
									borderColor={pswDone ? "green.300" : undefined}
									mt="1vh"
								/>
								<Input
									isDisabled={!props.membership.administrator}
									key="pswTwoInput"
									placeholder="Confirm the above password"
									type="password"
									isInvalid={pswError}
									value={pswTwo}
									onChange={(e) => setPswTwo(e.target.value)}
									borderColor={pswDone ? "green.300" : undefined}
									mt="1vh"
								/>
							</Flex>
						</Collapse>
						<Flex justifyContent={"end"}>
							{pswDisable ? (
								<Heading
									mr="2vw"
									alignSelf={"center"}
									size="sm"
									color="red.300"
								>
									This will disable password
								</Heading>
							) : undefined}
							<Button
								mt="1vh"
								colorScheme="green"
								isDisabled={!props.membership.administrator || !canSave}
								alignSelf={"end"}
								onClick={saveConfig}
							>
								Save
							</Button>
						</Flex>
						<Flex mt='3vh' p='1vh 1vw' overflow={'auto'} borderWidth={1} borderColor={'yellow.300'} borderRadius={'md'} flexDir={'column'} maxH='30vh'>
							<Heading size='md' mb='1vh'> Members</Heading>
							<MemberRow avatar={me.avatar} intra_login={me.intra_login} nickname={me.nickname} status="online" key={`ch${props.channel.id}-${me.intra_login}`} />
							{members.map(e => <MemberRow {...e} key={`ch${props.channel.id}-${e.intra_login}`} />)}
						</Flex>
					</DrawerBody>
					<DrawerFooter>
						<IconButton
							size="lg"
							colorScheme="yellow"
							icon={<CloseIcon />}
							onClick={onClose}
							aria-label="close channel settings"
						/>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		</Center>
	);
}

export function MessageSection(
	props: ChannelComponentProps & { syncAll: () => void },
): JSX.Element {
	const [messages, setMessages] = useState<Array<MessageCardProps>>([]);

	const [text, setText] = useState("");
	const messagesRef = useRef<HTMLDivElement>(null);
	const channelName = props.channel.user2user
		? props.channel.Memberships[0].user.nickname
		: props.channel.name;

	async function send() {
		if (text === "") return;
		const message = {
			message: text,
			channelId: props.channelId,
		};
		if (props.socket) {
			if (props.socket.connected) {
				try {
					const response = await props.socket.emitWithAck(
						"channel_message",
						message,
					);
					setText("");
				} catch (e) {
					console.log(e); //TODO: make some king of popUp
				}
			} else console.log("Socket offline");
		}
	}
	function serverMessage(data: any) {
		const parsedData = messageResponseSchema.element.parse(data);
		if (parsedData.channel_id === props.channelId) {
			const tempMessages = [...messages, { ...parsedData, me: props.userId }];
			setMessages(tempMessages);
		}
	}
	useEffect(() => {
		chatSocket.on("server_message", serverMessage);
		return () => {
			chatSocket.off("server_message", serverMessage);
		};
	});
	useEffect(() => {
		fetchMessagesFromChannel(props.channelId)
			.then((e) => {
				setMessages(
					e.map((e) => {
						return { ...e, me: props.userId };
					}),
				);
			})
			.catch();
	}, [props.userId, props.channelId]);
	useEffect(() => {
		if (messagesRef.current) {
			messagesRef.current.scrollTo({
				behavior: "smooth",
				top: messagesRef.current.scrollHeight,
			});
		}
	}, [messages]);

	return (
		<>
			<Flex bg="pongBlue.300" p="2vh 1vw" justify={"space-between"}>
				<Flex>
					{
						props.channel.user2user ? (<Avatar
							mr="2vw"
							name={channelName}
							src={props.channel.Memberships[0].user.avatar}
						/>) : (<Avatar
							mr="2vw"
							name={channelName}
						/>)
					}
					<Heading>{channelName}</Heading>
				</Flex>
				{props.channel.user2user ? (
					<>{/* TODO: Add here component to block the other user */}</>
				) : (
					<HStack>
						<InviteMembers
							syncAll={props.syncAll}
							channel={props.channel}
							membership={{
								channelId: props.channelId,
								userId: props.userId,
								owner: props.owner,
								administrator: props.administrator,
								banned: props.banned,
								muted: props.muted,
							}}
						/>
						<GroupSettings
							syncAll={props.syncAll}
							channel={props.channel}
							membership={{
								channelId: props.channelId,
								userId: props.userId,
								owner: props.owner,
								administrator: props.administrator,
								banned: props.banned,
								muted: props.muted,
							}}
						/>
					</HStack>
				)}
			</Flex>
			<Box flexGrow={1} bg="pongBlue" overflowY="auto" ref={messagesRef}>
				<Stack p="1vh 2vw">
					{messages.map((m) => (
						<MessageCard {...m} key={`${m.id}`} />
					))}
				</Stack>
			</Box>
			<Box flexGrow={0} bg="pongBlue.300" pl="2vw" pr="2vw" pt="1vh" pb="1vh">
				<InputGroup bg="pongBlue.500">
					<Input
						value={text}
						onChange={(e) => setText(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								send();
							}
						}}
					/>
					<InputRightAddon>
						<EmailIcon onClick={send} focusable={true} />
					</InputRightAddon>
				</InputGroup>
			</Box>
		</>
	);
}



export function InviteMembers(props: {
	membership: Omit<ChannelComponentProps, "channel">;
	channel: ChannelData["channel"];
	syncAll: () => void;
}) {
	const { isOpen, onClose, onOpen } = useDisclosure();
	const [text, setText] = useState("");
	const [me, setMe] = useContext(MeStateContext);

	const [friends, setFriends] = useState<Array<ReturnUserSchema>>([]);
	const [members, setMembers] = useState<Array<ReturnUserSchema>>([]);

	const [visibleUsers, setVisibleUsers] = useState<
		Array<ReturnUserSchema & { friend: boolean }>
	>([]);

	useEffect(() => {
		getMembers(props.channel.id)
			.then((e) => setMembers(e))
			.catch((e) => { });
	}, []);

	useEffect(() => {
		if (me === null) {
			getMe()
				.then((e) => setMe(e))
				.catch((e) => setMe(null));
		}
	});

	useEffect(() => {
		if (isOpen) {
			getAllFriends()
				.then((e) =>
					setFriends(e.filter((e) => e.intra_login !== me?.intra_login)),
				)
				.catch((e) => console.log(e));
		}
	}, [isOpen, me?.intra_login]);

	const visibleUserCallback = useCallback(() => {
		if (text !== "") {
			let withoutMe: Array<ReturnUserSchema> = [
				...members.filter((e) => {
					let filter = diacriticalNormalize(text);
					return (
						diacriticalNormalize(e.nickname.toLocaleLowerCase()).includes(
							filter,
						) ||
						diacriticalNormalize(e.intra_login.toLocaleLowerCase()).includes(
							filter,
						)
					);
				}),
			];
			const addedFriendStatus = withoutMe.map((e) => {
				return {
					...e,
					friend: friends.some((f) => f.intra_login === e.intra_login),
				};
			});
			setVisibleUsers(addedFriendStatus);
		} else {
			const addedFriendStatus = friends.map((e) => {
				return {
					...e,
					friend: friends.some((f) => f.intra_login === e.intra_login),
				};
			});
			setVisibleUsers(addedFriendStatus);
		}
	}, [text, members, friends]);

	useEffect(visibleUserCallback, [friends]);

	return (
		<Center>
			<IconButton
				colorScheme="yellow"
				size="lg"
				icon={<AddIcon />}
				aria-label="channel settings"
				onClick={onOpen}
			/>
			<Drawer
				isOpen={isOpen}
				placement="right"
				onClose={onClose}
				size={"lg"}
				colorScheme="yellow"
			>
				<DrawerOverlay />
				<DrawerContent>
					<DrawerHeader>Invite Friends </DrawerHeader>
					<DrawerBody>
						<Flex m="5" flexDir={"column"} h="70vh" overflow={"hidden"}>
							<HStack>
								<Input
									value={text}
									minH={"2.5em"}
									onChange={(e) => setText(e.target.value)}
									bg="pongBlue.300"
									placeholder="Type a nickname or intra login"
								/>
								<IconButton
									colorScheme="yellow"
									icon={<CloseIcon />}
									onClick={onClose}
									aria-label="close add friend"
								/>
							</HStack>
							<Stack overflow={"auto"} mt="1vh">
								{visibleUsers.map((e) => (
									<InviteUserCard
										userData={e}
										me={me?.intra_login ?? ""}
										key={`addFriend-${e.intra_login}`}
										sync={() => {
											getAllFriends()
												.then((e) => setFriends(e))
												.catch((e) => { });
										}}
									/>
								))}
								{visibleUsers.length === 0 ? (
									<Center>
										<Heading color="red.400">No User Found</Heading>
									</Center>
								) : undefined}
							</Stack>
						</Flex>
					</DrawerBody>
					<DrawerFooter>
						<IconButton
							size="lg"
							colorScheme="yellow"
							icon={<CloseIcon />}
							onClick={onClose}
							aria-label="close channel settings"
						/>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		</Center>
	);
}

function InviteUserCard(props: {
	userData: ReturnUserSchema & { friend: boolean };
	me: string;
	sync: () => void;
}) {
	const [loading, setLoading] = useState(false);

	async function addFriend() {
		setLoading(true);
		try {
			await createFriendship({
				fOne: props.me,
				fTwo: props.userData.intra_login,
			});
			props.sync();
		} catch (e) {
			console.warn("Could not add friend");
		}
		setLoading(false);
	}

	return (
		<Flex
			w="100%"
			p="1vh 1vw"
			justifyContent="space-between"
			borderRadius={10}
			borderColor={"yellow.300"}
			borderWidth={2}
		>
			<Box w="50%">
				<Avatar src={props.userData.avatar}>
					<AvatarBadge boxSize="1.25em" bg={"green.300"} />
				</Avatar>
				<Box display="inline-block">
					<Heading fontWeight="medium" size="md" pl="1vw">
						{props.userData.nickname}
					</Heading>
					<Heading fontWeight="light" size="xs" pl="1vw">
						{props.userData.intra_login}
					</Heading>
				</Box>
			</Box>
			<Box w="30%">
				<Heading size="sm">Elo</Heading>
				<Text>{props.userData.elo}</Text>
			</Box>
			<Center>
				<Button
					isDisabled={props.userData.friend}
					isLoading={loading}
					colorScheme="green"
					onClick={addFriend}
				>
					{props.userData.friend ? "Friend" : "Add"}
				</Button>
			</Center>
		</Flex>
	);
}
