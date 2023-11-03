'use client'
import PageLayout from "@/components/pageLayout/PageLayout";
import { List, Stack, Text, Box, Button, Input } from "@chakra-ui/react";
import React, { useState, useEffect, ReactElement } from "react";
import { Socket, io } from "socket.io-client";

const URL = "http://localhost:3000";

const useLocalStorage = (name: string) => {
	const [value, setValue] = useState("");

	useEffect(() => {
		// @ts-ignore
		setValue(localStorage.getItem(name));
	}, []);

	return value;
};

const token = () => {
	if (typeof window !== "undefined")
		return localStorage.getItem("token") ?? '';
	return ''
}

export const socket = io(URL, {
	autoConnect: false,
	extraHeaders: {
		Authorization: token(),
	},
});

export default function Chat() {
	const [isConnected, setIsConnected] = useState(socket.connected);
	const [receiveMessage, setReceiveMessage] = useState([""]);
	const [value, setValue] = useState("");
	const handleValueChange = (event: any) => setValue(event.target.value);
	const [isLoading, setIsLoading] = useState(false);

	function handleSubmit(event: any) {
		event.preventDefault();
		setIsLoading(true);

		socket.timeout(5000).emit("send_message", value, () => {
			setIsLoading(false);
		});
	}

	useEffect(() => {
		function onConnect() {
			setIsConnected(true);
		}

		function onDisconnect() {
			setIsConnected(false);
		}

		function onReceiveMessage(value: string) {
			setReceiveMessage((previous) => [...previous, value]);
		}

		socket.on("connect", onConnect);
		socket.on("disconnect", onDisconnect);
		socket.on("receive_message", onReceiveMessage);

		return () => {
			socket.off("connect", onConnect);
			socket.off("disconnect", onDisconnect);
			socket.off("receive_message", onReceiveMessage);
		};
	}, []);

	return (
		<Stack>
			<Text>State: {`${isConnected}`}</Text>
			<Stack>
				<Button
					onClick={() => {
						socket.connect();
					}}
				>
					Connect
				</Button>
				<Button
					onClick={() => {
						socket.disconnect();
					}}
				>
					Disconnect
				</Button>
			</Stack>
			<Stack>
				<Input value={value} onChange={handleValueChange} />
				<Button onClick={handleSubmit} disabled={isLoading}>
					Submit
				</Button>
			</Stack>
			<List>
				{receiveMessage.map((event, index) => (
					<Text key={index}>{event}</Text>
				))}
			</List>
		</Stack>
	);
}

Chat.getLayout = function getLayoutPage(page: ReactElement) {
	return (
		<PageLayout>
			{page}
		</PageLayout>
	)
}