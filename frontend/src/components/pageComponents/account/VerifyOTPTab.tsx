"use client";
import { Flex, Stack, Text, Button } from "@chakra-ui/react";
import { PinInput, PinInputField } from "@chakra-ui/react";
import { useContext, useRef, useState } from "react";
import { verifyOTP } from "./verifyOTP";
import { ModalContext } from "../../../pages/account";

export const VerifyOTPTab: React.FC<{}> = (props) => {
	const [value, setValue] = useState("");
	const [text, setText] = useState("");
	const goToNext = useContext(ModalContext);
	const firstPinRef = useRef<HTMLInputElement>(null);
	const getter = async (token: string) => {
		const verified = await verifyOTP(token);
		if (!verified) {
			setValue("");
			setText("Invalid Code, try again");
			if (firstPinRef.current !== null) firstPinRef.current.focus();
		} else {
			goToNext();
		}
	};

	return (
		<Stack>
			<Text textAlign="center" fontSize="2xl">
				Insert the code generated in your phone
			</Text>
			<Text textAlign="center" fontSize="lg">
				{text}
			</Text>
			<Flex justify="space-around" mt="1vh">
				<PinInput
					type="number"
					colorScheme="yellow.300"
					size="lg"
					focusBorderColor="gray.500"
					otp
					value={value}
					onChange={setValue}
					isDisabled={false}
				>
					<PinInputField
						ref={firstPinRef}
						borderColor="yellow.300"
						borderRadius="50%"
						borderWidth="2px"
						color="yellow.300"
						fontWeight="extrabold"
						fontSize="xl"
					></PinInputField>
					<PinInputField
						borderColor="yellow.300"
						borderRadius="50%"
						borderWidth="2px"
						color="yellow.300"
						fontWeight="extrabold"
						fontSize="xl"
					></PinInputField>
					<PinInputField
						borderColor="yellow.300"
						borderRadius="50%"
						borderWidth="2px"
						color="yellow.300"
						fontWeight="extrabold"
						fontSize="xl"
					></PinInputField>
					<PinInputField
						borderColor="yellow.300"
						borderRadius="50%"
						borderWidth="2px"
						color="yellow.300"
						fontWeight="extrabold"
						fontSize="xl"
					></PinInputField>
					<PinInputField
						borderColor="yellow.300"
						borderRadius="50%"
						borderWidth="2px"
						color="yellow.300"
						fontWeight="extrabold"
						fontSize="xl"
					></PinInputField>
					<PinInputField
						borderColor="yellow.300"
						borderRadius="50%"
						borderWidth="2px"
						color="yellow.300"
						fontWeight="extrabold"
						fontSize="xl"
					></PinInputField>
				</PinInput>
			</Flex>
			<Button
				onClick={() => {
					getter(value);
				}}
			>
				Send
			</Button>
		</Stack>
	);
};
