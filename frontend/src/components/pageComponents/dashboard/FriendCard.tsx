'use client';
import { Avatar, AvatarBadge, Box, Button, Center, Flex, Heading, Input, Modal, ModalBody, ModalContent, ModalOverlay, Stack, Tab, TabList, TabPanel, TabPanels, Tabs, Text, VStack, useDisclosure } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { ReturnUserSchema, fetchUsers } from '@/lib/fetchers/users';
import { useCallback, useEffect, useState } from 'react';
import diacriticalNormalize from '@/lib/diacriticalNormalize';
import { createFriendship, getAllFriends } from '@/lib/fetchers/friends';


function ContactRow(props: ReturnUserSchema) {
	const color = props.status === 'online' ? 'green.300' : 'gray.300'
	return (
		<Flex w='100%' pl='1vw' pr='1vw' justifyContent='space-between'>
			<Box>
				<Avatar src={props.avatar}>
					<AvatarBadge boxSize='1.25em' bg={color} />
				</Avatar>
				<Box display='inline-block'>
					<Heading fontWeight='medium' size='md' pl='1vw'>{props.nickname}</Heading>
					<Heading fontWeight='light' size='xs' pl='1vw'>{props.intra_login}</Heading>
				</Box>
			</Box>
			<Box display='inline-block'>
				<Heading fontWeight='medium' size='md' pl='1vw'>Elo</Heading>
				<Heading fontWeight='light' size='xs' pl='1vw'>{props.elo}</Heading>
			</Box>
		</Flex>
	);
}

function UserCard(props: { userData: ReturnUserSchema & { friend: boolean }, me: string, sync: () => void }) {
	const [loading, setLoading] = useState(false);

	async function addFriend() {
		setLoading(true);
		try {
			await createFriendship({ fOne: props.me, fTwo: props.userData.intra_login });
			props.sync();
		} catch (e) {
			console.warn('Could not add friend');
		}
		setLoading(false);
	}

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
			<Center>
				<Button
					isDisabled={props.userData.friend}
					isLoading={loading}
					colorScheme='green'
					onClick={addFriend}
				>
					{props.userData.friend ? 'Friend' : 'Add'}
				</Button>
			</Center>
		</Flex>
	)
}
function AddFriendModal(props: { isOpen: boolean, onOpen: () => void, onClose: () => void, me: string, friendList: Array<ReturnUserSchema>, sync: () => void }) {
	const [text, setText] = useState('');
	const [allUsers, setAllUsers] = useState<Array<ReturnUserSchema>>([]);
	const [visibleUsers, setVisibleUsers] = useState<Array<ReturnUserSchema & { friend: boolean }>>([]);

	const visibleUserCallback = useCallback(() => {
		if (text !== '') {
			let withoutMe: Array<ReturnUserSchema> = [...allUsers.filter(e => {
				let filter = diacriticalNormalize(text);
				return diacriticalNormalize(e.nickname.toLocaleLowerCase()).includes(filter) || diacriticalNormalize(e.intra_login.toLocaleLowerCase()).includes(filter);
			})]
			const addedFriendStatus = withoutMe.map(e => {
				return {
					...e,
					friend: props.friendList.some(f => f.intra_login === e.intra_login)
				}

			})
			setVisibleUsers(addedFriendStatus)
		} else {
			const addedFriendStatus = allUsers.map(e => {
				return {
					...e,
					friend: props.friendList.some(f => f.intra_login === e.intra_login)
				}

			})
			setVisibleUsers(addedFriendStatus)
		}
	}, [text, allUsers]);

	useEffect(visibleUserCallback, [allUsers])
	useEffect(() => {
		if (props.isOpen) {
			fetchUsers().then(e => setAllUsers(e.filter(e => e.intra_login !== props.me))).catch(e => console.log(e));
		}
	}, [props.isOpen, props.me])
	useEffect(() => {
		const filterTimeout = setTimeout(visibleUserCallback, 300);
		return (() => {
			clearTimeout(filterTimeout);
		})
	}, [text, visibleUserCallback])
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
						<Input
							value={text}
							minH={'2.5em'}
							onChange={(e) => setText(e.target.value)}
							bg='pongBlue.300'
							placeholder='type a nickname or intra login' />
						<Stack overflow={'auto'} mt='1vh' >
							{visibleUsers.map(e => <UserCard userData={e} me={props.me} key={`addFriend-${e.intra_login}`} sync={props.sync} />)}
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
	const [friends, setFriends] = useState<Array<ReturnUserSchema>>([]);


	useEffect(() => {
		getAllFriends().then(e => setFriends(e)).catch(e => { })
	}, [props.id])
	return (
		<>
			<Flex flexDir='column' h='370px' w='370px' alignItems='stretch' pl='1vw' pr='1vw'>
				<Heading textAlign='center' pt='1vh'>Friends</Heading>
				<Button
					onClick={onOpen}
					rightIcon={<AddIcon />}
					mb='2vh'
					mt='1vh'
					colorScheme='yellow'>
					Add friend
				</Button>
				<VStack overflow={'auto'}>
					{friends.map(f => <ContactRow {...f} />)}
				</VStack>
			</Flex>
			<AddFriendModal
				isOpen={isOpen}
				onOpen={onOpen}
				onClose={onClose}
				me={props.id}
				friendList={friends}
				sync={() => { getAllFriends().then(e => setFriends(e)).catch(e => { }) }} />
		</>
	);
}
