"use client";
import {
	Avatar,
	AvatarBadge,
	Box,
	Button,
	Flex,
	Heading,
	Tab,
	TabList,
	TabPanel,
	TabPanels,
	Tabs,
	Text,
	VStack,
} from "@chakra-ui/react";
import BlockUserTab from "./BlockUserTab";
import { FriendTab } from "./FriendTab";
import { useCallback, useContext, useEffect, useState } from "react";
import { ReturnUserSchema, fetchUsers } from "@/lib/fetchers/users";
import { createFriendship, getAllFriends } from "@/lib/fetchers/friends";
import { MeStateContext } from "@/components/pageLayout/PageLayout";
import AllUsersTab from "./AllUsersTab";
import { ReturnAllBlockedUsersResponse, blockUser, fetchAllBlockedUsers } from "@/lib/fetchers/chat";
import { useRouter } from "next/router";
import { fetchWrapper } from "@/lib/fetchers/SafeAuthWrapper";

export type UserCardData = ReturnUserSchema & { friend?: boolean, blocked?: boolean }

export function UserCard(props: {
	userData: UserCardData;
	syncFriends: () => void,
	syncBlocked: () => void,
}) {
	const [loading, setLoading] = useState(false);
	const [me] = useContext(MeStateContext);
	const router = useRouter();


	async function addFriend() {
		setLoading(true);
		try {
			await fetchWrapper(router, createFriendship, {
				fOne: me.intra_login,
				fTwo: props.userData.intra_login,
			});
			props.syncFriends();
		} catch (e) {
			console.warn("Could not add friend");
		}
		setLoading(false);
	}

	async function blockUserRequest() {
		setLoading(true);
		try {
			await fetchWrapper(router, blockUser, {
				issuerId: me.intra_login,
				targetId: props.userData.intra_login,
			});
			props.syncBlocked();
		} catch (e) {
			console.warn("Could not block user");
		}
		setLoading(false);
	}

	return (
		<Flex
			w="100%"
			p="1vh 1vw"
			justifyContent="space-between"
			alignItems={'center'}
			borderRadius={10}
			borderColor={"yellow.300"}
			borderWidth={2}
		>
			<Box w="50%">
				<Avatar src={props.userData.avatar}>
					<AvatarBadge boxSize="1.25em" bg={props.userData.status === 'online' ? "green.300" : "gray.300"} />
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
			<VStack spacing={0} >
				<Button
					borderBottomRadius={0}
					width={'5em'}
					isDisabled={props.userData.friend}
					isLoading={loading}
					colorScheme="green"
					onClick={addFriend}
				>
					{props.userData.friend ? "Friend" : "Add"}
				</Button>
				<Button
					borderTopRadius={0}
					width={'5em'}
					isDisabled={props.userData.blocked}
					colorScheme="red"
					isLoading={loading}
					onClick={blockUserRequest}
				>
					Block
				</Button>
			</VStack>
		</Flex>
	);
}


export default function FriendCard(props: {}) {
	const [users, setUsers] = useState<ReturnUserSchema[]>([])
	const [friends, setFriends] = useState<ReturnUserSchema[]>([])
	const [blockedUsers, setBlockedUsers] = useState<ReturnAllBlockedUsersResponse[]>([]);
	const [me] = useContext(MeStateContext);
	const router = useRouter();

	function syncFriends() {
		fetchWrapper(router, getAllFriends)
			.then((e) => setFriends(e))
			.catch(() => console.error('Could not fetch friends'));
	}
	function syncBlocked() {
		fetchWrapper(router, fetchAllBlockedUsers)
			.then((e) => setBlockedUsers(e))
			.catch(() => console.error('Could not fetch blocked'));
	}
	const formatUsers = useCallback(() => {
		try {
			return (
				users.filter(e => e.intra_login !== me.intra_login).map(usr => {
					return {
						...usr,
						friend: friends.some(f => f.intra_login === usr.intra_login),
						blocked: blockedUsers.some(b => b.target_id === usr.intra_login)
					}
				})
			)
		} catch (e) {
			return [];
		}
	}, [users, friends, blockedUsers])
	const formatFriends = useCallback(() => {
		try {
			return (
				friends.map(f => {
					return {
						...f,
						friend: true,
						blocked: blockedUsers.some(b => b.target_id === f.intra_login)
					}
				}))
		} catch (e) {
			return []
		}
	}, [users, friends, blockedUsers])
	const formatBlocked = useCallback(() => {
		try {
			return (
				blockedUsers.map(bl => {
					return {
						...bl,
						friend: friends.some(f => f.intra_login === bl.target_id),
						blocked: true
					}
				})
			)
		} catch (e) {
			return []
		}
	}, [users, friends, blockedUsers])

	useEffect(() => {
		fetchWrapper(router, fetchUsers).then(e => { setUsers(e) }).catch(f => { console.warn(`Could not fetch users`) });
		fetchWrapper(router, getAllFriends).then(e => { setFriends(e) }).catch(f => { console.warn(`Could not fetch friends`) });
		fetchWrapper(router, fetchAllBlockedUsers).then(e => { setBlockedUsers(e) }).catch(f => { console.log(`Could not fetch blocked users`) });
	}, []);

	return (
		<Tabs isFitted variant="soft-rounded" >
			<TabList pt='1'>
				<Tab>All</Tab>
				<Tab>Friendship</Tab>
				<Tab>Blocked</Tab>
			</TabList>
			<TabPanels>
				<TabPanel pl={5} pr={5}>
					<AllUsersTab allUsers={formatUsers()} syncFriends={syncFriends} syncBlocked={syncBlocked} />
				</TabPanel>
				<TabPanel>
					<FriendTab friends={formatFriends()} />
				</TabPanel>
				<TabPanel>
					<BlockUserTab users={formatBlocked()} syncBlocked={syncBlocked} />
				</TabPanel>
			</TabPanels>
		</Tabs>
	);
}
