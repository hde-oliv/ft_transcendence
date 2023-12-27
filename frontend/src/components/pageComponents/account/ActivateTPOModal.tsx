"use client";
import { LockIcon } from "@chakra-ui/icons";
import { Box, Button } from "@chakra-ui/react";
import { useSteps } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
} from "@chakra-ui/react";
import { getTwoFacQR } from "@/lib/fetchers/getTwoFacQR";
import { VerifyOTPTab } from "./VerifyOTPTab";
import { ModalContext } from "../../../pages/account";
import { QRCodeImage } from "./QRCodeImage";
import { Spinner } from "@chakra-ui/react";
import {
	Step,
	StepDescription,
	StepIcon,
	StepIndicator,
	StepStatus,
	StepTitle,
	Stepper,
} from "@chakra-ui/react";
import { fetchWrapper } from "@/lib/fetchers/SafeAuthWrapper";
import { useRouter } from "next/router";

type TwoFactorActivatorProps = {
	onClose: () => void;
	setOTP: (v: boolean) => void;
	isOpen: boolean;
};

type TwoAuthSteps = {
	activeStep: number;
};
export const steps = [
	{ title: "Load QRcode", description: "Point your camera at the QRcode" },
	{
		title: "Confirmation",
		description: "Insert the code generated in your phone",
	},
];
export const TwoAuthStepper: React.FC<TwoAuthSteps> = (props) => {
	const { activeStep } = props;

	return (
		<Stepper index={activeStep} gap="0" colorScheme="yellow" pl="2vw" pr="2vw">
			{steps.map((step, index) => (
				<Step key={index}>
					<StepIndicator>
						<StepStatus
							complete={<StepIcon />}
							incomplete={""}
							active={<Spinner speed="2s" color="white" />}
						/>
					</StepIndicator>
					<Box flexShrink="0">
						<StepTitle>{step.title}</StepTitle>
						<StepDescription>{step.description}</StepDescription>
					</Box>
				</Step>
			))}
		</Stepper>
	);
};

export const ActivateTPOModal: React.FC<TwoFactorActivatorProps> = (props) => {
	const { onClose, isOpen, setOTP } = props;
	const [qrCode, setQrcode] = useState("");
	const router = useRouter();
	const { activeStep, goToNext, goToPrevious, setActiveStep } = useSteps({
		index: 0,
		count: steps.length,
	});

	useEffect(() => {
		if (isOpen) {
			(async () => {
				const qrCodeUrl = await fetchWrapper(router, getTwoFacQR);
				if (qrCodeUrl !== "") {
					const image = await QRCode.toDataURL(qrCodeUrl);
					setQrcode(image);
				}
			})();
		}
	}, [isOpen]);

	const ModalTab: React.FC<{ index: number }> = (props) => {
		if (props.index === 0)
			return <QRCodeImage src={qrCode} aria-label="two-factor-qr-code" />;
		else if (props.index === 1) return <VerifyOTPTab />;
		return (
			<Box pt="3vh">
				<LockIcon boxSize="10" />
			</Box>
		);
	};

	return (
		<Modal
			isCentered
			onClose={() => {
				onClose(), setActiveStep(0);
			}}
			isOpen={isOpen}
			motionPreset="slideInBottom"
			size="3xl"
		>
			<ModalContext.Provider value={goToNext}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Enabling Two Factor Authentication</ModalHeader>
					<ModalCloseButton />
					<TwoAuthStepper activeStep={activeStep} />
					<ModalBody display="flex" justifyContent={"center"}>
						<ModalTab index={activeStep} />
					</ModalBody>
					<ModalFooter>
						{activeStep === 0 ? (
							<Button onClick={goToNext} colorScheme="green">
								Next
							</Button>
						) : (
							<></>
						)}
						{activeStep === 1 ? (
							<Button onClick={goToPrevious} colorScheme="red">
								Back
							</Button>
						) : (
							<></>
						)}
						{activeStep === 2 ? (
							<Button
								onClick={() => {
									onClose(), setActiveStep(0);
									setOTP(true);
								}}
								colorScheme="green"
							>
								Ok
							</Button>
						) : (
							<></>
						)}
					</ModalFooter>
				</ModalContent>
			</ModalContext.Provider>
		</Modal>
	);
};
