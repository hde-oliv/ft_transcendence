'use client'
import PageLayout from "@/components/pageLayout/PageLayout";
import { EditIcon, UnlockIcon, LockIcon } from "@chakra-ui/icons";
import pinkGuy from './pinkGuy'
import { Avatar, AvatarBadge, Box, Button, Card, CardBody, CardHeader, Center, Heading, IconButton, Spinner, StackDivider, useDisclosure } from "@chakra-ui/react";
import { Flex, Container, Image, Stack, Text } from '@chakra-ui/react';
import { PinInput, PinInputField } from '@chakra-ui/react'
import {
	Step, StepDescription, StepIcon, StepIndicator,
	StepNumber, StepSeparator, StepStatus, StepTitle,
	Stepper, useSteps
} from '@chakra-ui/react';

import { FC, useEffect, useState } from "react";
import QRCode from 'qrcode';

import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
} from '@chakra-ui/react'
import getTwoFacQR from "@/lib/fetchers/getTwoFacQR";

const base64Image = pinkGuy;

type TwoFactorActivatorProps = {
	onClose: () => void,
	isOpen: boolean
}

const QRCodeImage: React.FC<{ src: string, 'aria-label': string }> = (props) => {
	if (props.src) {
		return <Image src={`${props.src}`} aria-label={props["aria-label"]} />
	}
	return <Spinner size='xl' color='yellow' />
}

const PinInputContainer: React.FC<{}> = (props) => {
	return (
		<Stack>
			<Text textAlign='center' fontSize='2xl'>Insert the code generated in your phone</Text>
			<Flex justify='space-around' mt='1vh'>
				<PinInput type='number' colorScheme='yellow.300' size='lg' focusBorderColor='gray.500'>
					<PinInputField borderColor='yellow.300' borderRadius='50%' borderWidth='2px' color='yellow.300' fontWeight='extrabold' fontSize='xl'></PinInputField>
					<PinInputField borderColor='yellow.300' borderRadius='50%' borderWidth='2px' color='yellow.300' fontWeight='extrabold' fontSize='xl'></PinInputField>
					<PinInputField borderColor='yellow.300' borderRadius='50%' borderWidth='2px' color='yellow.300' fontWeight='extrabold' fontSize='xl'></PinInputField>
					<PinInputField borderColor='yellow.300' borderRadius='50%' borderWidth='2px' color='yellow.300' fontWeight='extrabold' fontSize='xl'></PinInputField>
					<PinInputField borderColor='yellow.300' borderRadius='50%' borderWidth='2px' color='yellow.300' fontWeight='extrabold' fontSize='xl'></PinInputField>
					<PinInputField borderColor='yellow.300' borderRadius='50%' borderWidth='2px' color='yellow.300' fontWeight='extrabold' fontSize='xl'></PinInputField>
				</PinInput>
			</Flex>
		</Stack>
	)
}

const TwoFactorActivator: React.FC<TwoFactorActivatorProps> = (props) => {
	const { onClose, isOpen } = props;
	const [qrCode, setQrcode] = useState('');
	const { activeStep, goToNext, goToPrevious } = useSteps({
		index: 0,
		count: steps.length,
	})

	useEffect(() => {
		if (isOpen) {
			(
				async () => {
					const qrCodeUrl = await getTwoFacQR();
					if (qrCodeUrl !== '') {
						const image = await QRCode.toDataURL(qrCodeUrl)
						setQrcode(image);
					}
				}
			)()
		}
	}, [isOpen])

	const ModalTab: React.FC<{ index: number }> = (props) => {
		if (props.index === 0)
			return <QRCodeImage src={qrCode} aria-label="two-factor-qr-code" />
		return <PinInputContainer />
	}
	return (
		<Modal
			isCentered
			onClose={onClose}
			isOpen={isOpen}
			motionPreset='slideInBottom'
			size='3xl'
		>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>Enabling Two Factor Authentication</ModalHeader>
				<ModalCloseButton />
				<TwoAuthStepper activeStep={activeStep} />
				<ModalBody display='flex' justifyContent={'center'}>
					<ModalTab index={activeStep} />
				</ModalBody>
				<ModalFooter justifyContent={'space-between'}>
					<Box>
						<Button onClick={goToPrevious} colorScheme='red' borderRightRadius={0}>Back</Button>
						<Button onClick={goToNext} colorScheme='green' borderLeftRadius={0} >Next</Button>
					</Box>
					<Button colorScheme='red' mr={3} onClick={onClose}>
						Close
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	)
}

const steps = [
	{ title: 'Load QRcode', description: 'Point your camera at the QRcode', },
	{ title: 'Confirmation', description: 'Insert the code generated in your phone', },
	{ title: 'All Done', description: '', },
]

type TwoAuthSteps = {
	activeStep: number
}
const TwoAuthStepper: React.FC<TwoAuthSteps> = (props) => {
	const { activeStep } = props;

	return (
		<Stepper index={activeStep} gap='0' colorScheme="yellow" pl='1vw' pr='1vw'>
			{steps.map((step, index) => (
				<Step key={index}>
					<StepIndicator>
						<StepStatus
							complete={<StepIcon />}
							incomplete={''}
							active={<Spinner speed="2s" color="white" />}
						/>
					</StepIndicator>

					<Box flexShrink='0'>
						<StepTitle>{step.title}</StepTitle>
						<StepDescription>{step.description}</StepDescription>
					</Box>


				</Step>
			))}
		</Stepper>
	)
}

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
				<TwoFactorActivator isOpen={isOpenTF} onClose={onCloseTF} />
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