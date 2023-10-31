'use client'
import PageLayout from "@/components/pageLayout/PageLayout";
import { CheckIcon, EditIcon, LockIcon, UnlockIcon } from "@chakra-ui/icons";
import { Button, Card, CardBody, CardHeader, Center, Heading, IconButton, Input, StackDivider } from "@chakra-ui/react";
import { Flex, Stack, Text, Avatar, AvatarBadge, Box, useDisclosure } from '@chakra-ui/react';
import { Fade, ScaleFade, Slide, SlideFade, Collapse } from '@chakra-ui/react'
import { createContext, useEffect, useState } from "react";
import { ActivateTPOModal } from "./ActivateTPOModal";
import pinkGuy from './pinkGuy'
import getMe from "@/lib/fetchers/me";
import { DisableTPOModal } from "./DisableTPOModal";

type UserNickSegmentProps = userData
function UserNickSegment(props: UserNickSegmentProps): JSX.Element {
	const { onOpen, onClose, isOpen } = useDisclosure();


	return (
		<Flex justifyContent='space-between' alignItems='stretch'>
			<Box flexGrow={1}>
				<Heading pl='1vw' size='sm'>Your Nickname </Heading>
				<Text pl='2vw'>{props.nickname}</Text>
				<Collapse in={isOpen} >
					<Flex >
						<Input flexGrow={1} ml='2vw' placeholder='New Nickname' bg='pongBlue.800' />
						<IconButton
							colorScheme="yellow"
							aria-label="save-new-nickname"
							w='5vw'
							onClick={onClose}
							icon={<CheckIcon />}
						/>
					</Flex>
				</Collapse>
			</Box>
			<IconButton
				colorScheme="yellow"
				aria-label="edit"
				w='5vw'
				onClick={isOpen ? onClose : onOpen}
				icon={<EditIcon />}
			/>
		</Flex>
	)
}


export const ModalContext = createContext<() => void>(() => { });
const base64Image = pinkGuy;

type userData = {
	forthyTwoTag: string,
	avatar: string,
	nickname: string,
	otpEnabled: boolean
}

export type DisableTPOModalProps = {
	onClose: () => void,
	isOpen: boolean
}

export default function Account() {
	const { isOpen: isOpenTF, onOpen: onOpenTF, onClose: onCloseTF } = useDisclosure();
	const { isOpen: isOpenDisabler, onOpen: onOpenDisabler, onClose: onCloseDisabler } = useDisclosure();
	const [userData, setUserData] = useState<undefined | userData>(undefined);

	const OTPButton = () => {
		if (userData) {
			if (userData.otpEnabled) {
				return (
					<Button
						rightIcon={<LockIcon bg='transparent' />}
						pl='vw'
						aria-label="Enable two factor auth"
						bg='green.500'
						colorScheme="green"
						onClick={onOpenDisabler}>
						Disable
					</Button>
				)
			}
			return (
				<Button
					rightIcon={<UnlockIcon bg='transparent' />}
					pl='vw'
					aria-label="Enable two factor auth"
					bg='red.500'
					colorScheme="red"
					onClick={onOpenTF}>
					Enable
				</Button>
			)
		}
	}
	useEffect(() => {
		const token = localStorage.getItem('token');
		if (token !== null) {
			(async () => {
				try {
					const ftData = await getMe();
					let tmp = {
						forthyTwoTag: ftData.intra_login,
						avatar: ftData.avatar,
						nickname: ftData.nickname,
						otpEnabled: ftData.otp_enabled
					}
					setUserData(tmp);
				} catch (e) {
				}
			})()
		}
	}, [])
	if (!userData)
		return (
			<Center>
				Loading
			</Center>
		)
	return (
		<PageLayout>
			<Center pt='2vh'>
				<Flex flexDir='column'>
					<Card bg='pongBlue.500'>
						<CardHeader w='80vw'>
							<Heading textAlign='center'>Account details</Heading>
						</CardHeader>
						<CardBody>
							<Stack divider={<StackDivider />} pl='20%' pr='20%'>
								<Flex justify='center' pb='2vh'>
									<Avatar size='2xl' src={base64Image}>
										<AvatarBadge border='none' bg='transparent'>
											<IconButton
												colorScheme='yellow'
												aria-label='Edit Avatar'
												size='lg'
												isRound={true}
												icon={<EditIcon />}
											/>
										</AvatarBadge>
									</Avatar>
								</Flex>
								<Box>
									<Heading pl='1vw' size='sm' >Your Intra Tag </Heading>
									<Text pl='2vw' >{userData.forthyTwoTag}</Text>
								</Box>
								<UserNickSegment {...userData} />
								<Box>
									<ActivateTPOModal isOpen={isOpenTF} onClose={onCloseTF} />
									<DisableTPOModal isOpen={isOpenDisabler} onClose={onCloseDisabler} />
									<Heading pl='1vw' size='sm' >Security </Heading>
									<Flex pl='1vw' justify='space-between'>
										<Text pl='1vw'>Two Factor Authenticator is {userData.otpEnabled ? 'enabled' : 'disabled'}</Text>
										<OTPButton />
									</Flex>
								</Box>
							</Stack>
						</CardBody>
					</Card>
				</Flex>
			</Center>
		</PageLayout >
	)
}

