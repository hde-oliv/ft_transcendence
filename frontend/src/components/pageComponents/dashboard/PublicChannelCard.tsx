"use client";
import {
  Avatar,
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  ModalHeader,
  ModalCloseButton,
  VStack,
  ModalFooter,
  Text,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { userData } from '../../../pages/account/index';
import { 
    PublicChannelResponse,
    fetchAllPublicChannels,
    joinPublicChannel,
    fetchUserCheckInChannel } from "@/lib/fetchers/chat";

function ChannelRow(props: PublicChannelResponse) {
  const [loading, setLoading] = useState(false);
  const [isUserInChannel, setIsUserInChannel] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    const fetchUserStatus = async () => {
      const userCheckIn = await fetchUserCheckInChannel(props.id);
      setIsUserInChannel(userCheckIn);
    };
    fetchUserStatus();
  }, [props.id]);

  const joinChannel = useCallback(async () => {
    if (props.protected) {
      setShowPasswordModal(true);
    } else {
      setLoading(true);
      try {
        await joinPublicChannel({
          channelId: props.id,
          password: password
        });
      } catch (e) {
        console.warn("Could not join channel :(");
      }
      setLoading(false);
    }
  }, [props.id, props.protected]);

  const handlePasswordSubmit = useCallback(async () => {
    setLoading(true);
    try {
      await joinPublicChannel({
        channelId: props.id,
        password: password,
      });
    } catch (e) {
      console.warn("Could not join channel :(");
    }
    setLoading(false);
    setPassword(''); // clear password
    setShowPasswordModal(false); // close modal
  }, [props.id, password]);

  return (
    <Flex w="100%"
    p="1vh 1vw"
    justifyContent="space-between"
    borderRadius={10}
    borderColor={"yellow.300"}
    borderWidth={2}>
      <Box>
      <Avatar name={props.name} />
        <Box display="inline-block">
          <Heading fontWeight="medium" size="md" pl="1vw">
            {props.name}
          </Heading>
        </Box>
      </Box>
      <Center>
        <Button
          isDisabled={isUserInChannel}
          isLoading={loading}
          colorScheme="green"
          onClick={joinChannel}
        >
          {isUserInChannel ? "Joined" : "Join"}
        </Button>
      </Center>
      <Modal
      onClose={() => setShowPasswordModal(false)}
      isOpen={showPasswordModal}
      isCentered={true}
      size="sm"
    >
      <ModalOverlay />
      <ModalContent bg="pongBlue.500">
      <ModalHeader>Password is required</ModalHeader>
      <ModalCloseButton />
        <ModalBody>
            <Input
              value={password}
              minH={"2.5em"}
              onChange={(e) => setPassword(e.target.value)}
              bg="pongBlue.300"
              placeholder="channel password"
            />
        </ModalBody>
        <ModalFooter>
        <Center>
          <Button
              colorScheme="yellow"
              onClick={handlePasswordSubmit}
            >OK</Button>
        </Center>
        </ModalFooter>
      </ModalContent>
    </Modal>
    </Flex>
  );
}

export function ChannelCard() {
  const [channels, setChannels] = useState<Array<PublicChannelResponse>>([]);

  useEffect(() => {
    fetchAllPublicChannels()
    .then((e) => setChannels(e))
    .catch((e) => { });
  }, []);

  return (
    <>
      <Flex
        flexDir="column"
        h="370px"
        w="370px"
        alignItems="stretch"
        pl="1vw"
        pr="1vw"
      >
        <Heading textAlign="center" pt="1vh">
          Channels
        </Heading>
        <VStack overflow={"auto"}>
          {channels.map((c) => (
            <ChannelRow {...c} key={`ChannelLine-${c.id}`} />
          ))}
        </VStack>
      </Flex>
    </>
  );
}
