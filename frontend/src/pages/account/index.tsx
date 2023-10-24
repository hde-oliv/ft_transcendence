'use client'
import PageLayout from "@/components/pageLayout/PageLayout";
import { EditIcon, UnlockIcon } from "@chakra-ui/icons";
import { Card, CardBody, CardHeader, Center, Heading, IconButton, StackDivider } from "@chakra-ui/react";
import { Flex, Stack, Text, Avatar, AvatarBadge, Box, useDisclosure } from '@chakra-ui/react';
import { createContext, useState } from "react";
import { TwoFactorActivatorModal } from "./TwoFactorActivator";
import pinkGuy from './pinkGuy'

export const ModalContext = createContext<() => void>(() => { });

const base64Image = pinkGuy;

export default function Games() {
	const { isOpen: isOpenTF, onOpen: onOpenTF, onClose: onCloseTF } = useDisclosure();
	const [userData, setUserData] = useState({
		forthyTwoTag: 'hde-camp',
		avatar: '',
		nickname: 'Badger',
		otpEnabled: false
	});

	return (
		<PageLayout>
			<Center pt='2vh'>
				<TwoFactorActivatorModal isOpen={isOpenTF} onClose={onCloseTF} />
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
								<Flex justifyContent='space-between'>
									<Box>
										<Heading pl='1vw' size='sm' >Your Intra Tag </Heading>
										<Text pl='2vw' >{userData.forthyTwoTag}</Text>
									</Box>
									<IconButton colorScheme="yellow" aria-label="edit" icon={<EditIcon />} w='5vw' />
								</Flex>
								<Box>
									<Heading pl='1vw' size='sm' >Security </Heading>
									<Flex pl='1vw' justify='space-between'>
										<Text pl='1vw'>Two Factor Authenticator is disabled</Text>
										<IconButton
											icon={<UnlockIcon bg='transparent' />}
											pl='vw'
											aria-label="Enable two factor auth"
											bg='red.500'
											colorScheme="red"
											w='5vw'
											onClick={onOpenTF} />
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