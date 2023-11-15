'use client';
import { Avatar, AvatarBadge, Box, Button, Center, Flex, Heading, Input, Modal, ModalBody, ModalContent, ModalOverlay, Stack, Text, VStack, useDisclosure } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { ReturnUserSchema, fetchUsers } from '@/lib/fetchers/users';
import { useCallback, useEffect, useState } from 'react';
import diacriticalNormalize from '@/lib/diacriticalNormalize';


function ContactRow(props: { online: boolean }) {
	const { online } = props;
	const color = online ? 'green.300' : 'gray.300'
	return (
		<Flex w='100%' pl='1vw' pr='1vw' justifyContent='space-between'>
			<Box>
				<Avatar>
					<AvatarBadge boxSize='1.25em' bg={color} />
				</Avatar>
				<Box display='inline-block'>
					<Heading fontWeight='medium' size='md' pl='1vw'>hde-camp</Heading>
					<Heading fontWeight='light' size='xs' pl='1vw'>hde-camp</Heading>
				</Box>
			</Box>
			<Box>
				<Text>21:23</Text>
			</Box>
		</Flex>
	);
}

function UserCard(props: { userData: ReturnUserSchema }) {
	return (
		<Flex w='100%' p='1vh 1vw' justifyContent='space-between' borderRadius={10} borderColor={'yellow.300'} borderWidth={2}>
			<Box w='50%'>
				<Avatar src={props.userData.avatar}>
					<AvatarBadge boxSize='1.25em' bg={'green.300'} />
				</Avatar>
				<Box display='inline-block'>
					<Heading fontWeight='medium' size='md' pl='1vw'>
						{props.userData.nickname}
					</Heading>
					<Heading fontWeight='light' size='xs' pl='1vw'>
						{props.userData.intra_login}
					</Heading>
				</Box>
			</Box>
			<Box w='30%'>
				<Heading size='sm'>Elo</Heading>
				<Text>{props.userData.elo}</Text>
			</Box>
			<Box>
				<Button colorScheme='green'>Add</Button>
			</Box>
		</Flex>
	)
}
function AddFriendModal(props: { isOpen: boolean, onOpen: () => void, onClose: () => void }) {
	const [text, setText] = useState('');
	const [allUsers, setAllUsers] = useState<Array<ReturnUserSchema>>([]);
	const [visibleUsers, setVisibleUsers] = useState<Array<ReturnUserSchema>>([]);

	const visibleUserCallback = useCallback(() => {
		if (text !== '') {
			let tmp: Array<ReturnUserSchema> = [...allUsers.filter(e => {
				let filter = diacriticalNormalize(text);
				return diacriticalNormalize(e.nickname.toLocaleLowerCase()).includes(filter) || diacriticalNormalize(e.intra_login.toLocaleLowerCase()).includes(filter);
			})];
			setVisibleUsers(tmp)
		} else {
			setVisibleUsers(allUsers);
		}
	}, [text, allUsers]);

	useEffect(visibleUserCallback, [allUsers])
	useEffect(() => {
		if (props.isOpen)
			fetchUsers().then(e => setAllUsers(e)).catch(e => console.log(e));
	}, [props.isOpen])
	useEffect(() => {
		const filterTimeout = setTimeout(visibleUserCallback, 300);
		return (() => {
			clearTimeout(filterTimeout);
		})
	}, [text])
	return (
		<Modal
			onClose={props.onClose}
			isOpen={props.isOpen}
			isCentered={true}
			size='xl'
		>
			<ModalOverlay />
			<ModalContent bg='pongBlue.500'>
				<ModalBody >
					<Flex flexDir={'column'} h='70vh' overflow={'hidden'}>
						<Heading textAlign={'center'} color='yellow.300'>Find a friend</Heading>
						<Input
							value={text}
							minH={'2.5em'}
							onChange={(e) => setText(e.target.value)}
							bg='pongBlue.300'
							placeholder='type a nickname or intra login' />
						<Stack overflow={'auto'} mt='1vh' >
							{visibleUsers.map(e => <UserCard userData={e} key={`addFriend-${e.intra_login}`} />)}
							{visibleUsers.length === 0 ? (<Center><Heading color='red.400'>No User Found</Heading></Center>) : undefined}
						</Stack>
					</Flex>
				</ModalBody>
			</ModalContent>
		</Modal>
	)
}

//<>
//	<style>
//		{`
//	/* Hide the scrollbar but keep the ability to scroll */
//	::-webkit-scrollbar {
//		width: 0 !important;
//	}
//
//	/* Optional: Style the track and handle for a better visual appearance */
//	::-webkit-scrollbar-track {
//		background: transparent;
//	}
//
//	::-webkit-scrollbar-thumb {
//		background: #888;
//		border-radius: 8px;
//	}
//	`}
//	</style>
//</>

export function FriendCard(props: { id: string; }) {
	const { isOpen, onOpen, onClose } = useDisclosure();
	useEffect(() => {
		// fetchUsers().then(e => console.log(e)).catch(e => console.log(e));
		// getAllFriends().then(e => console.log(e)).catch(e => console.log(e)); //Get friends of the caller
		// getFriendsById(props.id).then(e => console.log(e)).catch(e => console.log(e)); //getFriend data?
		// getFriendsByUser(props.id).then(e => console.log(e)).catch(e => console.log(e)); // ??
		// createFriendship()
	}, [props.id])
	return (
		<>
			<Flex flexDir='column' h='370px' w='370px' alignItems='stretch'>
				<Heading textAlign='center' pt='1vh'>Friends</Heading>
				<Button
					onClick={onOpen}
					rightIcon={<AddIcon />}
					mb='2vh'
					mt='1vh'
					colorScheme='yellow'>
					Add friend
				</Button>
				<VStack>
					<ContactRow online={true} />
					<ContactRow online={false} />
					<ContactRow online={true} />
				</VStack>
			</Flex>
			<AddFriendModal isOpen={isOpen} onOpen={onOpen} onClose={onClose} />
		</>
	);
}
