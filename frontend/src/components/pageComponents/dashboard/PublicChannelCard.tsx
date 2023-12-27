"use client";
import {
	Avatar,
	Box,
	Button,
	Center,
	Flex,
	Heading,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalOverlay,
	ModalHeader,
	ModalCloseButton,
	VStack,
	ModalFooter,
	Text,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { userData } from '../../../pages/account/index';
import {
	PublicChannelResponse,
	fetchAllPublicChannels,
	joinPublicChannel,
	fetchUserCheckInChannel
} from "@/lib/fetchers/chat";
import { fetchWrapper } from "@/lib/fetchers/SafeAuthWrapper";
import { useRouter } from "next/router";

function ChannelRow(props: PublicChannelResponse) {
	const [loading, setLoading] = useState(false);
	const [isUserInChannel, setIsUserInChannel] = useState(false);
	const [showPasswordModal, setShowPasswordModal] = useState(false);
	const [password, setPassword] = useState('');
	const [passwordError, setPasswordError] = useState(false);
	const router = useRouter();

	useEffect(() => {
		const fetchUserStatus = async () => {
			const userCheckIn = await fetchWrapper(router, fetchUserCheckInChannel, props.id);
			setIsUserInChannel(userCheckIn);
		};
		fetchUserStatus();
	}, [props.id]);

	const joinChannel = useCallback(async () => {
		if (props.protected) {
			setShowPasswordModal(true);
		} else {
			setLoading(true);
			try {
				await fetchWrapper(router, joinPublicChannel, {
					channelId: props.id,
					password: password
				})
				setIsUserInChannel(true);
			} catch (e) {
				console.warn("Could not join channel :(");
			}
			setLoading(false);
		}
	}, [props.id, props.protected]);

	const handlePasswordSubmit = useCallback(async () => {
		setLoading(true);
		try {
			await fetchWrapper(router, joinPublicChannel, {
				channelId: props.id,
				password: password,
			});
			setPasswordError(false);
			setIsUserInChannel(true);
			setShowPasswordModal(false);
		} catch (e) {
			console.warn("Could not join channel :(");
			setPasswordError(true);
			setShowPasswordModal(true);
		}
		setLoading(false);
		setPassword('');
	}, [props.id, password]);

	return (
		<Flex w="100%"
			p="1vh 1vw"
			justifyContent="space-between"
			borderRadius={10}
			borderColor={"yellow.300"}
			borderWidth={2}>
			<Box>
				<Avatar name={props.name} />
				<Box display="inline-block">
					<Heading fontWeight="medium" size="md" pl="1vw">
						{props.name}
					</Heading>
				</Box>
			</Box>
			<Center>
				<Button
					isDisabled={isUserInChannel}
					isLoading={loading}
					colorScheme="green"
					onClick={joinChannel}
				>
					{isUserInChannel ? "Joined" : "Join"}
				</Button>
			</Center>
			<Modal
				onClose={() => setShowPasswordModal(false)}
				isOpen={showPasswordModal}
				isCentered={true}
				size="sm"
			>
				<ModalOverlay />
				<ModalContent bg="pongBlue.500">
					<ModalHeader>Password is required</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<Input
							value={password}
							minH={"2.5em"}
							onChange={(e) => setPassword(e.target.value)}
							bg="pongBlue.300"
							placeholder="channel password"
						/>
						{passwordError && <Text color="red">Invalid password. Please try again.</Text>}
					</ModalBody>
					<ModalFooter>
						<Center>
							<Button
								colorScheme="yellow"
								onClick={handlePasswordSubmit}
							>OK</Button>
						</Center>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</Flex>
	);
}

export function ChannelCard() {
	const [channels, setChannels] = useState<Array<PublicChannelResponse>>([]);
	const router = useRouter();
	useEffect(() => {
		fetchWrapper(router, fetchAllPublicChannels)
			.then((e) => setChannels(e))
			.catch((e) => { });
	}, []);

	return (
		<>
			<Flex
				flexDir="column"
				h="370px"
				w="370px"
				alignItems="stretch"
				pl="1vw"
				pr="1vw"
			>
				<Heading textAlign="center" pt="1vh">
					Channels
				</Heading>
				<VStack overflow={"auto"}>
					{channels.map((c) => (
						<ChannelRow {...c} key={`ChannelLine-${c.id}`} />
					))}
				</VStack>
			</Flex>
		</>
	);
}
