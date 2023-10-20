import PageLayout from "@/components/pageLayout/PageLayout";
import { Button, Flex, Input, Stack, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

function SocketTestOliv() {
	const socket = io("http://localhost:3000/chat");

	const [messages, setMessages] = useState([""]);
	const [newMessage, setNewMessage] = useState("");

	useEffect(() => {
		socket.on("receive_message", (msg) => {
			receiveMessage(msg);
		});

		//     getInitialMessages();
		return (() => {
			if (socket.connected)
				socket.disconnect();
		})
	}, []);
	// const getInitialMessages = () => {
	//fetch("http://localhost:3000/chat")
	//.then((res) => res.json())
	//.then((data) => {
	//setMessages([data]);
	//});
	//};
	const receiveMessage = (msg: any) => {
		const newList = [...messages, msg];
		console.log(newList);
		setMessages(newList);
		console.log(messages);
	};

	const sendMessage = () => {
		socket.emit("send_message", newMessage);
		setNewMessage("");
	};

	const handleChange = (event: any) => setNewMessage(event.target.value);

	return (
		<div>
			<Input
				placeholder="New message"
				value={newMessage}
				onChange={handleChange}
			/>
			<Button onClick={sendMessage}>Send Message</Button>

			<Stack>
				{messages.map((msg, index) => {
					return <Text key={index}>{`${msg}`}</Text>;
				})}
			</Stack>
		</div>
	)
}
function SocketTestCamp() {

	const [response, setResponse] = useState('');

	useEffect(() => {
		const socket = io('ws://localhost:3000', { transports: ['websocket'] });
		socket.on('receive_message', (data) => {
			setResponse(data);
		})
		return (() => {
			if (socket.connected)
				socket.disconnect();
		})
	}, [])
	return (
		<div>
			<p>
				The current value of the socket is: {response}
			</p>
		</div>
	);


}
export default function Chat() {


	return (
		<PageLayout>
			<SocketTestCamp />
		</PageLayout>
	);
}
