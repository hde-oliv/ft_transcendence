"use client";
import GamePage from "@/components/game/p5";
import PageLayout from "@/components/pageLayout/PageLayout";
import { MeResponseData, getMe } from "@/lib/fetchers/me";
import { fetchUsers } from "@/lib/fetchers/users";
import { AddIcon } from "@chakra-ui/icons";
import {
	List,
	Stack,
	Text,
	Box,
	Button,
	Input,
	AvatarBadge,
	Avatar,
	Flex,
	Heading,
	VStack,
	Wrap,
	WrapItem,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	Portal,
	DrawerFooter,
	Drawer,
	DrawerBody,
	DrawerCloseButton,
	DrawerContent,
	DrawerHeader,
	DrawerOverlay,
	useDisclosure,
	useSafeLayoutEffect,
	HStack,
} from "@chakra-ui/react";
import { Props } from "next/script";
import React, {
	useState,
	useEffect,
	ReactElement,
	PropsWithChildren,
	createContext,
	useContext,
	useRef,
} from "react";
import { Socket, io } from "socket.io-client";
import { nodeModuleNameResolver } from "typescript";

const URL = "https://transcendence.ngrok.io/game-socket";

const token = () => {
	if (typeof window !== "undefined") return localStorage.getItem("token") ?? "";
	return "";
};

export const socket = io(URL, {
	autoConnect: false,
	extraHeaders: {
		Authorization: token(),
	},
});

function GameSetup() {
	const [isConnected, setIsConnected] = useState(socket.connected);
	const [value, setValue] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [me, setMe] = useState<MeResponseData>();

	const handleValueChange = (event: any) => setValue(event.target.value);

	function handleStart(event: any) {
		event.preventDefault();
		socket.timeout(240).emit("start", { intra_login: me?.intra_login }, () => {
			setIsLoading(false);
		});
	}

	useEffect(() => {
		getMe()
			.then((res) => setMe(res))
			.catch((err) => console.log(err));
	}, []);

	useEffect(() => {
		function onConnect() {
			setIsConnected(true);
		}

		function onDisconnect() {
			setIsConnected(false);
		}

		// function onReceiveMessage(value: Message) {
		// console.warn(value.channel_id);
		// console.warn(chatRef.current);
		//
		// if (value.channel_id === chatRef.current.chatInfo?.id) {
		// setLocalMessages((previous) => [...previous, value]);
		// }
		// }

		socket.on("connect", onConnect);
		socket.on("disconnect", onDisconnect);
		// socket.on("receive_message", onReceiveMessage);

		return () => {
			socket.off("connect", onConnect);
			socket.off("disconnect", onDisconnect);
			// socket.off("receive_message", onReceiveMessage);
		};
	}, []);

	return (
		<Stack>
			<Text fontSize="xs">State: {`${isConnected}`}</Text>
			<Stack>
				<Button
					size="sm"
					onClick={() => {
						socket.connect();
					}}
				>
					Connect
				</Button>
				<Button
					size="sm"
					onClick={() => {
						socket.disconnect();
					}}
				>
					Disconnect
				</Button>
				<Button onClick={handleStart} disabled={isLoading}>
					Start
				</Button>
			</Stack>
		</Stack>
	);
}

export default function Game() {
	return (
		<>
			{/* <GameSetup /> */}
			<GamePage />
		</>
	);
}

Game.getLayout = function getLayoutPage(page: ReactElement) {
	return <PageLayout>{page}</PageLayout>;
};
