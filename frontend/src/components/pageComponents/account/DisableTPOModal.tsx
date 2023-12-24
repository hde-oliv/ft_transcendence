"use client";
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
  Button,
} from "@chakra-ui/react";
import { disableOTP } from "@/lib/fetchers/disableOTP";
import { useState, useRef, useEffect } from "react";
import { AxiosError } from "axios";
import { useAuthSafeFetch } from "@/lib/fetchers/SafeAuthWrapper";
import { useRouter } from "next/router";

type DisableTPOModalProps = {
  onClose: () => void;
  setOTP: (v: boolean) => void;
  isOpen: boolean;
};

const OTPInputStack: React.FC<{
  setOTP: (v: boolean) => void;
  close: () => void;
}> = (props) => {
  const [value, setValue] = useState("");
  const [text, setText] = useState("");
  const firstPinRef = useRef<HTMLInputElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const router = useRouter()

  let btnFocus = () => {
    setTimeout(() => {
      if (btnRef.current) {
        btnRef.current.focus();
      }
    }, 50);
  };
  let inputFocus = () => {
    setTimeout(() => {
      if (firstPinRef.current) {
        firstPinRef.current.focus();
      }
    }, 50);
  };

  const getter = async (token: string) => {
    try {
      await useAuthSafeFetch(router, disableOTP, token);
      props.setOTP(false);
      props.close();
    } catch (e) {
      if (e instanceof AxiosError) {
        if (e.response) {
          if (e.response.status === 401) {
            setText("Invalid OTP, try agan");
          }
        }
      }
      setValue("");
      inputFocus();
    }
  };
  useEffect(inputFocus, []);
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
          onComplete={btnFocus}
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
        ref={btnRef}
        onClick={() => {
          getter(value);
        }}
      >
        Disable
      </Button>
    </Stack>
  );
};

export const DisableTPOModal: React.FC<DisableTPOModalProps> = (props) => {
  const { onClose, isOpen, setOTP } = props;
  return (
    <Modal
      isCentered
      onClose={onClose}
      isOpen={isOpen}
      motionPreset="slideInBottom"
      size="3xl"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Disabling Two Factor Authentication</ModalHeader>
        <ModalCloseButton />

        <ModalBody display="flex" justifyContent={"center"}>
          <OTPInputStack setOTP={setOTP} close={onClose} />
        </ModalBody>
        <ModalFooter></ModalFooter>
      </ModalContent>
    </Modal>
  );
};
