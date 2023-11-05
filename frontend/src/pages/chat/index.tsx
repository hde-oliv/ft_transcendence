"use client";
import PageLayout from "@/components/pageLayout/PageLayout";
import {
  fetchDirectChannelByUsers,
  fetchMessagesFromChannel,
} from "@/lib/fetchers/chat";
import { MeResponseData, getMe } from "@/lib/fetchers/me";
import fetchUsers from "@/lib/fetchers/users";
import { AddIcon } from "@chakra-ui/icons";
import {
  List,
  Stack,
  Text,
  Box,
  Button,
  Input,
  AvatarBadge,
  Avatar,
  Flex,
  Heading,
  VStack,
  Wrap,
  WrapItem,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  DrawerFooter,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  useDisclosure,
  useSafeLayoutEffect,
  HStack,
} from "@chakra-ui/react";
import { Props } from "next/script";
import React, {
  useState,
  useEffect,
  ReactElement,
  PropsWithChildren,
  createContext,
  useContext,
  useRef,
} from "react";
import { Socket, io } from "socket.io-client";
import { nodeModuleNameResolver } from "typescript";

const ChatContext = createContext<ChatContextType>({} as ChatContextType);

const URL = "http://localhost:3000";

const token = () => {
  if (typeof window !== "undefined") return localStorage.getItem("token") ?? "";
  return "";
};

export const socket = io(URL, {
  autoConnect: false,
  extraHeaders: {
    Authorization: token(),
  },
});

interface User {
  nickname: string;
  avatar: string;
  intra_login: string;
  status: string;
  elo: number;
}

function Chats() {
  const [users, setUsers] = useState<User[]>();

  useEffect(() => {
    fetchUsers()
      .then((res) => setUsers(res))
      .catch((err) => console.log(err));
  }, []);

  return (
    <Flex flexDir="row" alignItems="stretch">
      <VStack>
        <Heading textAlign="center" p="1vh">
          People
        </Heading>
        <VStack>
          {users?.map((user, index) => {
            return (
              <ContactRow
                key={index}
                nickname={user.nickname}
                avatar={user.avatar}
                intra_login={user.intra_login}
                status={user.status}
                elo={user.elo}
              />
            );
          })}
        </VStack>
      </VStack>
    </Flex>
  );
}

function ContactAvatar(
  props: PropsWithChildren & {
    avatar: string;
    color: string;
    intra_login: string;
  }
) {
  const { chatRef, setChat } = useContext(ChatContext);

  const handleDirectChat = async () => {
    const me = await getMe();
    const channel = await fetchDirectChannelByUsers(
      me.intra_login,
      props.intra_login
    );
    const messages = await fetchMessagesFromChannel(channel.id);

    setChat({
      isOpen: chatRef.current.isOpen,
      onOpen: chatRef.current.onOpen,
      onClose: chatRef.current.onClose,
      chatInfo: channel,
      messages: messages,
    });

    chatRef.current.onOpen();
  };

  const handleOpenProfile = () => {};

  const handleBlock = () => {};

  const handleChallenge = () => {};

  return (
    <Menu>
      <MenuButton>
        <Avatar src={props.avatar} mr="3">
          <AvatarBadge boxSize="1.25em" bg={props.color} />
        </Avatar>
      </MenuButton>
      <Portal>
        <MenuList>
          <MenuItem onClick={handleChallenge}>Challenge</MenuItem>
          <MenuItem onClick={handleBlock}>Block</MenuItem>
          <MenuItem onClick={handleDirectChat}>Open Direct Chat</MenuItem>
          <MenuItem onClick={handleOpenProfile}>Open Profile</MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  );
}

function ContactRow(
  props: PropsWithChildren & {
    nickname: string;
    avatar: string;
    intra_login: string;
    status: string;
    elo: number;
  }
) {
  const { nickname, avatar, intra_login, status, elo } = props;
  const color = status === "online" ? "green.300" : "gray.300";

  return (
    <Flex w="100%" pl="1vw" pr="1vw">
      <ContactAvatar avatar={avatar} color={color} intra_login={intra_login} />
      <HStack>
        <Heading fontWeight="medium" size="md" pl="1vw">
          {nickname}
        </Heading>
        <Heading fontWeight="light" size="xs" pl="1vw">
          {intra_login}
        </Heading>
        <Text>{elo}</Text>
      </HStack>
    </Flex>
  );
}

function ChatModal(props: PropsWithChildren & { isOpen: any; onClose: any }) {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [localMessages, setLocalMessages] = useState<Array<Message>>([]);
  const [value, setValue] = useState("");
  const handleValueChange = (event: any) => setValue(event.target.value);
  const [isLoading, setIsLoading] = useState(false);
  const [me, setMe] = useState<MeResponseData>();

  const { chatRef } = useContext(ChatContext);

  function handleSubmit(event: any) {
    event.preventDefault();
    setIsLoading(true);
    socket
      .timeout(240)
      .emit(
        "send_message",
        { channel_name: chatRef.current.chatInfo?.name, message: value },
        () => {
          setIsLoading(false);
        }
      );
  }

  useEffect(() => {
    getMe()
      .then((res) => setMe(res))
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onReceiveMessage(value: Message) {
      console.warn(value.channel_id);
      console.warn(chatRef.current);

      if (value.channel_id === chatRef.current.chatInfo?.id) {
        setLocalMessages((previous) => [...previous, value]);
      }
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("receive_message", onReceiveMessage);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("receive_message", onReceiveMessage);
    };
  }, []);

  useEffect(() => {
    setLocalMessages(chatRef.current.messages || []);

    if (props.isOpen === false) {
      setLocalMessages([]);
    }
  }, [chatRef, chatRef.current.messages, props.isOpen]);

  return (
    <>
      <Drawer isOpen={props.isOpen} placement="right" onClose={props.onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>{chatRef.current.chatInfo?.name}</DrawerHeader>

          <DrawerBody>
            <Text fontSize="xs">Id: {chatRef.current.chatInfo?.id}</Text>
            <Text fontSize="xs">Name: {chatRef.current.chatInfo?.name}</Text>
            <Text fontSize="xs">
              Password: {chatRef.current.chatInfo?.password}
            </Text>
            <Text fontSize="xs">
              Protected: {String(chatRef.current.chatInfo?.protected)}
            </Text>
            <Text fontSize="xs">Type: {chatRef.current.chatInfo?.type}</Text>
            <Text fontSize="xs">
              Direct: {String(chatRef.current.chatInfo?.user2user)}
            </Text>

            <Stack>
              <Text fontSize="xs">State: {`${isConnected}`}</Text>
              <Stack>
                <Button
                  size="sm"
                  onClick={() => {
                    socket.connect();
                  }}
                >
                  Connect
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    socket.disconnect();
                  }}
                >
                  Disconnect
                </Button>
              </Stack>
              <Stack></Stack>
              <List>
                {localMessages.map((msg, index) => (
                  <Stack
                    borderRadius="sm"
                    key={index}
                    spacing="1"
                    bgColor={
                      me?.intra_login === msg.user_id
                        ? "green.500"
                        : "black.500"
                    }
                    mt="2"
                    mb="2"
                    p="3"
                  >
                    <Text fontSize="xs">{msg.time}</Text>
                    <Text fontSize="xs">{msg.user_id} says:</Text>
                    <Text color="white" fontSize="sm">
                      {msg.message}
                    </Text>
                  </Stack>
                ))}
              </List>
            </Stack>
          </DrawerBody>

          <DrawerFooter>
            <Input value={value} onChange={handleValueChange} />
            <Button onClick={handleSubmit} disabled={isLoading}>
              Submit
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default function Chat() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [chat, setChat] = useState<Chat>({
    isOpen,
    onOpen,
    onClose,
    chatInfo: null,
    messages: null,
  });

  const chatRef = useRef(chat);
  chatRef.current = chat;

  // useEffect(() => {
  //   if (isOpen === true) {
  //     setChat({
  //       isOpen: chat.isOpen,
  //       onClose: chat.onClose,
  //       onOpen: chat.onOpen,
  //       chatInfo: null,
  //       messages: null,
  //     });
  //   }
  // }, []);

  useEffect(() => {
    socket.connect();
  }, []);

  return (
    <ChatContext.Provider value={{ chatRef, setChat }}>
      <Wrap spacing="30px" justify="center">
        <WrapItem
          p="5"
          borderRadius="30"
          borderWidth="2px"
          borderColor="yellow.400"
        >
          <ChatModal onClose={onClose} isOpen={isOpen} />
          <Chats />
        </WrapItem>
      </Wrap>
    </ChatContext.Provider>
  );
}

type ChatContextType = {
  chatRef: React.MutableRefObject<Chat>;
  setChat: React.Dispatch<React.SetStateAction<Chat>>;
};

interface Message {
  id: string;
  channel_id: number;
  user_id: string;
  message: string;
  time: string;
}

interface ChatInfo {
  id: number;
  type: string;
  name: string;
  password: string;
  protected: boolean;
  user2user: boolean;
}

interface Chat {
  isOpen: any;
  onOpen: any;
  onClose: any;
  chatInfo: ChatInfo | null;
  messages: Message[] | null;
}

Chat.getLayout = function getLayoutPage(page: ReactElement) {
  return <PageLayout>{page}</PageLayout>;
};
