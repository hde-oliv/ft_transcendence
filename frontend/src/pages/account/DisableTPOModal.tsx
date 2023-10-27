'use client';
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
	Stack,
	Text,
	PinInput,
	PinInputField,
	Flex,
	Button
} from "@chakra-ui/react";
import { DisableTPOModalProps } from ".";
import { useState, useRef } from "react";

const OTPInputStack: React.FC<{}> = (props) => {
	const [value, setValue] = useState('');
	const [text, setText] = useState('');
	const firstPinRef = useRef<HTMLInputElement>(null);
	const getter = async (token: string) => {
		// const verified = await verifyOTP(token);
		// if (!verified) {
		// 	setValue('');
		// 	setText('Invalid Code, try again');
		// 	if (firstPinRef.current !== null)
		// 		firstPinRef.current.focus();
		// } else {
		// 	goToNext();
		// }
	};

	return (
		<Stack>
			<Text textAlign='center' fontSize='2xl'>Insert the code generated in your phone</Text>
			<Text textAlign='center' fontSize='lg'>{text}</Text>
			<Flex justify='space-around' mt='1vh'>
				<PinInput
					type='number'
					colorScheme='yellow.300'
					size='lg'
					focusBorderColor='gray.500'
					otp
					value={value}
					onChange={setValue}
					isDisabled={false}
				>
					<PinInputField ref={firstPinRef} borderColor='yellow.300' borderRadius='50%' borderWidth='2px' color='yellow.300' fontWeight='extrabold' fontSize='xl'></PinInputField>
					<PinInputField borderColor='yellow.300' borderRadius='50%' borderWidth='2px' color='yellow.300' fontWeight='extrabold' fontSize='xl'></PinInputField>
					<PinInputField borderColor='yellow.300' borderRadius='50%' borderWidth='2px' color='yellow.300' fontWeight='extrabold' fontSize='xl'></PinInputField>
					<PinInputField borderColor='yellow.300' borderRadius='50%' borderWidth='2px' color='yellow.300' fontWeight='extrabold' fontSize='xl'></PinInputField>
					<PinInputField borderColor='yellow.300' borderRadius='50%' borderWidth='2px' color='yellow.300' fontWeight='extrabold' fontSize='xl'></PinInputField>
					<PinInputField borderColor='yellow.300' borderRadius='50%' borderWidth='2px' color='yellow.300' fontWeight='extrabold' fontSize='xl'></PinInputField>
				</PinInput>
			</Flex>
			<Button onClick={() => { getter(value); }}>Disable</Button>
		</Stack>
	);
};

export const DisableTPOModal: React.FC<DisableTPOModalProps> = (props) => {
	const { onClose, isOpen } = props;
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
				<ModalHeader>Disabling Two Factor Authentication</ModalHeader>
				<ModalCloseButton />

				<ModalBody display='flex' justifyContent={'center'}>
					<OTPInputStack />
				</ModalBody>
				<ModalFooter>

				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};
