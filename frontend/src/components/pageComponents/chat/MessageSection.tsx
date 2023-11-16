import { ChannelData, fetchMessagesFromChannel, messageResponseSchema } from "@/lib/fetchers/chat";
import chatSocket from "@/lib/sockets/chatSocket";
import { CloseIcon, EmailIcon, SettingsIcon } from "@chakra-ui/icons";
import {
	Avatar,
	Box, Button, Center, Checkbox, Collapse, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, DrawerOverlay, Flex, FormControl, FormLabel, Heading, IconButton, Input,
	InputGroup,
	InputRightAddon, Stack, Switch, Text, useDisclosure
} from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChannelComponentProps, MessageCardProps, MessageCard } from "../../../pages/chat";

export default function MessageSection(props: ChannelComponentProps): JSX.Element {
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
	function GroupSettings(props: { membership: Omit<ChannelComponentProps, 'channel'>, channel: ChannelData['channel'] }) {
		const { isOpen, onClose, onOpen } = useDisclosure();
		const { isOpen: editingPsw, onClose: closePws, onOpen: openPsw } = useDisclosure();

		return (
			<Center>
				<IconButton colorScheme="yellow" size='lg' icon={<SettingsIcon />} aria-label="channel settings" onClick={onOpen} />
				<Drawer isOpen={isOpen} placement="right" onClose={onClose} size={'lg'}>
					<DrawerOverlay />
					<DrawerContent>
						<DrawerHeader>Channel Settings</DrawerHeader>
						<DrawerBody>
							<FormControl>
								<FormLabel >Channel Name</FormLabel>
								<Input isDisabled={true} value={channelName} />

								<FormLabel mt='2vh'>Password</FormLabel>
								<Checkbox colorScheme="yellow" checked={editingPsw} onChange={(e) => { !editingPsw ? openPsw() : closePws() }} />
								<Collapse in={editingPsw}>
									<Flex>
										<Input type="password" isInvalid={false} />
										<Input type="password" isInvalid={true} />
									</Flex>
								</Collapse>
							</FormControl>
						</DrawerBody>
						<DrawerFooter>
							<IconButton size='lg' colorScheme='yellow' icon={<CloseIcon />} onClick={onClose} aria-label="close channel settings" />

						</DrawerFooter>
					</DrawerContent>
				</Drawer>
			</Center >
		)
	}
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
