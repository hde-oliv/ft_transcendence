import { ChannelData, UpdateChannelSchemma, fetchMessagesFromChannel, messageResponseSchema, patchChannel, updateChannelSchema } from "@/lib/fetchers/chat";
import chatSocket from "@/lib/sockets/chatSocket";
import { CloseIcon, EmailIcon, LockIcon, SettingsIcon, UnlockIcon } from "@chakra-ui/icons";
import {
	Avatar,
	Box, Button, Center, Checkbox, Collapse, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, DrawerOverlay, Flex, FormControl, FormLabel, Heading, IconButton, Input,
	InputGroup,
	InputRightAddon, Select, Stack, Switch, Text, useDisclosure
} from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChannelComponentProps, MessageCardProps, MessageCard } from "../../../pages/chat";
import z, { ZodError } from 'zod'

function GroupSettings(props: { membership: Omit<ChannelComponentProps, 'channel'>, channel: ChannelData['channel'], syncAll: () => void }) {
	const { isOpen, onClose, onOpen } = useDisclosure();
	const [editingPsw, setEditinPsw] = useState(false);
	const [pswOne, setPswOne] = useState('')
	const [pswTwo, setPswTwo] = useState('')
	const [channelType, setChannelType] = useState(props.channel.type);
	const [channelName, setChannelName] = useState(props.channel.name);

	useEffect(() => {
		setPswOne('');
		setPswTwo('');
		setChannelType(props.channel.type);
		setChannelName(props.channel.name);
	}, [props.channel.id])
	if (props.channel.user2user)
		return undefined;
	const pswError = (pswOne !== '' && pswTwo !== '') && pswOne !== pswTwo;
	const pswDone = (pswOne !== '' && pswTwo !== '') && pswOne === pswTwo;
	const pswDisable = props.channel.protected && !editingPsw
	const canSave = (channelName !== props.channel.name) || (channelType !== props.channel.type) || (pswDone || pswDisable);
	async function saveConfig() {
		try {
			const updatedChannelConfig = updateChannelSchema.parse({
				name: channelName,
				type: channelType,
				password: pswDone ? pswOne : '',
				protected: pswDone
			});
			await patchChannel(props.channel.id, updatedChannelConfig);
			props.syncAll();
		} catch (e) {
			if (e instanceof ZodError)
				console.warn('Error build patchChannel object');
		}
	}
	return (
		<Center>
			<IconButton colorScheme="yellow" size='lg' icon={<SettingsIcon />} aria-label="channel settings" onClick={onOpen} />
			<Drawer isOpen={isOpen} placement="right" onClose={onClose} size={'lg'} colorScheme="yellow">
				<DrawerOverlay />
				<DrawerContent >
					<DrawerHeader>Channel Settings &nbsp; {props.channel.protected ? <LockIcon /> : <UnlockIcon />} </DrawerHeader>
					<DrawerBody>
						<FormLabel >Channel Name</FormLabel>
						<Input
							value={channelName}
							onChange={({ target }) => setChannelName(target.value)}
							isDisabled={!props.membership.administrator}
							key='channelNameInput' />

						<FormLabel mt='2vh'>Type</FormLabel>
						<Select isDisabled={!props.membership.administrator} value={channelType} onChange={(e) => setChannelType(e.target.value as 'private' | 'public')} key='channelTypeSelection'>
							<option value='public'>Public</option>
							<option value='private'>Private</option>
						</Select>
						<FormLabel mt='2vh'>Password</FormLabel>
						<Checkbox
							display={'block'}
							ml='2vw'
							size='lg'
							isDisabled={!props.membership.administrator}
							colorScheme="yellow"
							isChecked={editingPsw}
							onChange={(e) => {
								console.log(`value:${e.target.value}`)
								console.log(`checked:${e.target.checked}`)
								setEditinPsw(e.target.checked)
							}}
						/>
						<Collapse in={editingPsw}>
							<Flex flexDir="column">
								<Input
									isDisabled={!props.membership.administrator}
									key='pswOneInput'
									placeholder="Type the new password"
									type="password"
									isInvalid={pswError}
									value={pswOne}
									onChange={(e) => setPswOne(e.target.value)}
									borderColor={pswDone ? 'green.300' : undefined}
									mt='1vh' />
								<Input
									isDisabled={!props.membership.administrator}
									key='pswTwoInput'
									placeholder="Confirm the above password"
									type="password"
									isInvalid={pswError}
									value={pswTwo}
									onChange={(e) => setPswTwo(e.target.value)}
									borderColor={pswDone ? 'green.300' : undefined}
									mt='1vh' />
							</Flex>
						</Collapse>
						<Flex justifyContent={'end'}>
							{pswDisable ? <Heading mr='2vw' alignSelf={'center'} size='sm' color="red.300">This will disable password</Heading> : undefined}
							<Button
								mt='1vh'
								colorScheme="green"
								isDisabled={!props.membership.administrator || !canSave}
								alignSelf={'end'}
								onClick={saveConfig}
							>
								Save
							</Button>
						</Flex>
					</DrawerBody>
					<DrawerFooter>
						<IconButton size='lg' colorScheme='yellow' icon={<CloseIcon />} onClick={onClose} aria-label="close channel settings" />
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		</Center >
	)
}

export default function MessageSection(props: ChannelComponentProps & { syncAll: () => void }): JSX.Element {
	const [messages, setMessages] = useState<Array<MessageCardProps>>([]);

	const [text, setText] = useState("");
	const messagesRef = useRef<HTMLDivElement>(null);
	const channelName = props.channel.user2user ? props.channel.Memberships[0].user.nickname : props.channel.name;

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
						message
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
					})
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
			<Flex bg='pongBlue.300' p='2vh 1vw' justify={'space-between'}>
				<Flex>
					<Avatar
						mr='2vw'
						name={channelName}
						src={props.channel.user2user ? props.channel.Memberships[0].user.avatar : undefined} />
					<Heading>{channelName}</Heading>
				</Flex>
				<GroupSettings
					syncAll={props.syncAll}
					channel={props.channel}
					membership={{
						channelId: props.channelId,
						userId: props.userId,
						owner: props.owner,
						administrator: props.administrator,
						banned: props.banned,
						muted: props.muted
					}} />
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
						}} />
					<InputRightAddon>
						<EmailIcon onClick={send} focusable={true} />
					</InputRightAddon>
				</InputGroup>
			</Box>
		</>
	);
}
