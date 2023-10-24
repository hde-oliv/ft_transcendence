import { PropsWithChildren } from 'react';
import { Flex, Container, Image, Stack, Text } from '@chakra-ui/react';
import { PinInput, PinInputField } from '@chakra-ui/react'
import { Spinner } from "@chakra-ui/react";
import { Box } from "@chakra-ui/react";
import { Step, StepDescription, StepIcon, StepIndicator, StepStatus, StepTitle, Stepper } from "@chakra-ui/react";
import { Spinner } from "@chakra-ui/react";
import { Box } from "@chakra-ui/react";
import { Step, StepDescription, StepIcon, StepIndicator, StepStatus, StepTitle, Stepper } from "@chakra-ui/react";
import { Spinner } from "@chakra-ui/react";
import { Box } from "@chakra-ui/react";
import { Step, StepDescription, StepIcon, StepIndicator, StepStatus, StepTitle, Stepper } from "@chakra-ui/react";
import { Spinner } from "@chakra-ui/react";
import { Box } from "@chakra-ui/react";
import { Step, StepDescription, StepIcon, StepIndicator, StepStatus, StepTitle, Stepper } from "@chakra-ui/react";
import { Spinner } from "@chakra-ui/react";
import { Box } from "@chakra-ui/react";
import { Step, StepDescription, StepIcon, StepIndicator, StepStatus, StepTitle, Stepper } from "@chakra-ui/react";
import { Spinner } from "@chakra-ui/react";
import { Box } from "@chakra-ui/react";
import { Step, StepDescription, StepIcon, StepIndicator, StepStatus, StepTitle, Stepper } from "@chakra-ui/react";
import { Spinner } from "@chakra-ui/react";
import { Box } from "@chakra-ui/react";
import { Step, StepDescription, StepIcon, StepIndicator, StepStatus, StepTitle, Stepper } from "@chakra-ui/react";
import { Spinner } from "@chakra-ui/react";
import { Box } from "@chakra-ui/react";
import { Step, StepDescription, StepIcon, StepIndicator, StepStatus, StepTitle, Stepper } from "@chakra-ui/react";
import { Spinner } from "@chakra-ui/react";
import { Box } from "@chakra-ui/react";
import { Step, StepDescription, StepIcon, StepIndicator, StepStatus, StepTitle, Stepper } from "@chakra-ui/react";

export default function TwoFaPage(props: PropsWithChildren) {
	return (
		<Flex dir='column' justify='center' align='center' h='100vh' bg='#030254' >
			<Container>
				<Flex justify='center' mb='5vh'>
					<Image src='logopong_login.png' alt='pong logo' />
				</Flex>
				<Stack>
					<Text color='orange' textAlign='center' fontSize='2xl'>Enter your code, soab</Text>
					<Flex justify='space-around' mt='1vh'>
						<PinInput type='number' colorScheme='orange.500' size='lg' focusBorderColor='yellow.500'>
							<PinInputField borderColor='orange.500' borderRadius='50%' borderWidth='2px' color='orange.500' fontWeight='extrabold' fontSize='xl'></PinInputField>
							<PinInputField borderColor='orange.500' borderRadius='50%' borderWidth='2px' color='orange.500' fontWeight='extrabold' fontSize='xl'></PinInputField>
							<PinInputField borderColor='orange.500' borderRadius='50%' borderWidth='2px' color='orange.500' fontWeight='extrabold' fontSize='xl'></PinInputField>
							<PinInputField borderColor='orange.500' borderRadius='50%' borderWidth='2px' color='orange.500' fontWeight='extrabold' fontSize='xl'></PinInputField>
							<PinInputField borderColor='orange.500' borderRadius='50%' borderWidth='2px' color='orange.500' fontWeight='extrabold' fontSize='xl'></PinInputField>
							<PinInputField borderColor='orange.500' borderRadius='50%' borderWidth='2px' color='orange.500' fontWeight='extrabold' fontSize='xl'></PinInputField>
						</PinInput>
					</Flex>
				</Stack>
			</Container >
		</Flex >
	)
}
type TwoAuthSteps = {
	activeStep: number;
};
export const steps = [
	{ title: 'Load QRcode', description: 'Point your camera at the QRcode' },
	{ title: 'Confirmation', description: 'Insert the code generated in your phone' }
];
export const TwoAuthStepper: React.FC<TwoAuthSteps> = (props) => {
	const { activeStep } = props;

	return (
		<Stepper index={activeStep} gap='0' colorScheme="yellow" pl='2vw' pr='2vw'>
			{steps.map((step, index) => (
				<Step key={index}>
					<StepIndicator>
						<StepStatus
							complete={<StepIcon />}
							incomplete={''}
							active={<Spinner speed="2s" color="white" />} />
					</StepIndicator>

					<Box flexShrink='0'>
						<StepTitle>{step.title}</StepTitle>
						<StepDescription>{step.description}</StepDescription>
					</Box>


				</Step>
			))}
		</Stepper>
	);
};
