import { fetchMessagesFromChannel, messageResponseSchema } from "@/lib/fetchers/chat";
import chatSocket from "@/lib/sockets/chatSocket";
import { EmailIcon } from "@chakra-ui/icons";
import {
	Box, Input,
	InputGroup,
	InputRightAddon, Stack
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { ChannelComponentProps, MessageCardProps, MessageCard } from "../../../pages/chat";

export default function MessageSection(props: ChannelComponentProps): JSX.Element {
	const [messages, setMessages] = useState<Array<MessageCardProps>>([]);
	const [text, setText] = useState("");
	const messagesRef = useRef<HTMLDivElement>(null);

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
