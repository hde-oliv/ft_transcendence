import PageLayout, { SocketContext } from "@/components/pageLayout/PageLayout";
import {
  ChannelData,
  MyChannels,
  createChannel,
  createChannelParams,
  fetchMyChannels,
  fetchSingleChannel,
  messageResponseSchema,
} from "@/lib/fetchers/chat";
import { AddIcon, RepeatIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  ButtonGroup,
  Center,
  Circle,
  Collapse,
  Flex,
  Heading,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Skeleton,
  Stack,
  Switch,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { ReactElement, createContext, useCallback, useContext, useEffect, useState } from "react";

import { ChannelCard } from "../../components/pageComponents/chat/ChannelCard";
import { MessageSection } from "@/components/pageComponents/chat/MessageSection";
import { ZodError } from "zod";
import _ from 'lodash';
import { useRouter } from "next/router";
import { fetchWrapper } from "@/lib/fetchers/SafeAuthWrapper";

export type userSchema = {
  nickname: string;
  avatar: string;
  intra_login: string;
  status: 'online' | 'offline';
};

type updateUserSchema = Partial<userSchema> & { intra_login: string };

export type ChannelComponentProps = ChannelData & {
  onClick?: () => void;
  lastMessage?: string;
};

type Message = {
  id: string;
  channel_id: number;
  user_id: string;
  message: string;
  time: Date;
  nickname: string;
};

export type MessageCardProps = Message & {
  me: string;
};

export function MessageCard(props: MessageCardProps): JSX.Element {
  let thirdPartMsg = props.user_id !== props.me;

  return (
    <Flex flexDir={thirdPartMsg ? "row" : "row-reverse"}>
      <Box
        bg={thirdPartMsg ? "gray.200" : "yellow.400"}
        minW={"40%"}
        maxW={"70%"}
        borderRadius={10}
        p="1vh 1vw"
      >
        {thirdPartMsg ?
          <Text fontWeight={'extrabold'} color="black" textAlign={thirdPartMsg ? "start" : "end"}>
            {props.nickname}:
          </Text> : undefined}

        <Text color="black" pl='1em' pt={thirdPartMsg ? '0' : '0.5em'}>{props.message}</Text>
        <Text fontSize='0.75em' color="black" textAlign={"end"}>
          {props.time.toLocaleDateString()}&nbsp;&nbsp;&nbsp;
          {props.time.toTimeString().slice(0, 8)}
        </Text>
      </Box>
    </Flex>
  );
}

export const ChatContext = createContext<{
  updateChannels: () => void,
  syncChannel: (payload: { channelId: number }) => Promise<void>
}>({
  updateChannels: () => { },
  syncChannel: async (payload: { channelId: number }) => { }
});

export default function Chat(props: any) {
  const socket = useContext(SocketContext);
  const [online, setOnline] = useState(socket.connected);
  const [activeChannel, setActiveChannel] = useState<number>(-1);
  const [myChannels, setMyChannels] = useState<ChannelComponentProps[]>([]);
  const [groupName, setGroupName] = useState("");
  const [groupPsw, setGroupPsw] = useState("");
  const [loading, setLoading] = useState(false);
  const { onOpen, onClose, isOpen, onToggle } = useDisclosure();
  const router = useRouter();

  function onConnect() {
    setOnline(true);
  }

  function onDisconnect() {
    setOnline(false);
  }

  const onServerMessage = useCallback(
    (data: any) => {
      const message = messageResponseSchema.element.parse(data);
      if (activeChannel > -1) {
        if (message.channel_id !== myChannels[activeChannel].channelId) {
          const tempChannels: ChannelComponentProps[] = [];
          myChannels.forEach((e) => tempChannels.push({ ...e }));
          let targetChannel = tempChannels.find(
            (e) => e.channelId === message.channel_id,
          );
          if (targetChannel) {
            targetChannel.lastMessage = message.message;
            setMyChannels(tempChannels); //TODO validate
          }
        }
      }
    },
    [activeChannel, myChannels],
  );

  async function createNewChannel() {
    const newChannel: createChannelParams = {
      name: groupName,
      password: groupPsw,
      protected: Boolean(groupPsw),
      type: "public",
      user2user: false,
      members: [],
    };
    setLoading(true);
    try {
      await fetchWrapper(router, createChannel, newChannel);
      setGroupName("");
      setGroupPsw("");
      await updateChannelCards();
      onClose();
    } catch (e) {
      console.warn("Could not create channel");
    }
    setLoading(false);
  }
  async function updateChannelCards() {
    try {
      let response = await fetchWrapper(router, fetchMyChannels);
      let parsedResp: Array<ChannelComponentProps> = response.map((newChan) => {
        let old = myChannels.find(oldChan => oldChan.channelId === newChan.channelId)
        let lastMessage: string = old?.lastMessage ?? '';
        return {
          ...newChan,
          lastMessage
        }
      })
      setMyChannels(parsedResp);
    } catch (e) {
      setMyChannels([]);
    }
  }
  const updateSingleCard = useCallback(
    (channelData: ChannelData) => {
      const temp = _.cloneDeep(myChannels);
      const targetI = temp.findIndex(ch => ch.channelId === channelData.channelId)
      if (targetI !== -1) {
        temp[targetI] = _.cloneDeep(channelData);
      } else {
        temp.push(channelData)
        temp.sort((a, b) => a.channelId - b.channelId);
      }
      setMyChannels(temp);
    }
    , [myChannels])

  const onSyncChannel = useCallback(async (payload: { channelId: number }) => {
    try {
      const channelData = await fetchWrapper(router, fetchSingleChannel, payload.channelId);
      updateSingleCard(channelData);
    } catch (e) {
      if (e instanceof ZodError) {
        console.warn(`Expected return of fetchSingleChannel was not met`);
      } else {
        console.warn(`Channel with id [${payload.channelId}] could't be syncronized`);
      }
    }
  }, [updateSingleCard, router])

  const onLeaveChannel = useCallback((payload: { channelId: number }) => {
    const tmp = myChannels.filter(e => e.channelId !== payload.channelId);
    setActiveChannel((prev) => prev - 1);
    setMyChannels([...tmp]);
  }, [myChannels]);

  const updateUser = useCallback((payload: updateUserSchema) => {
    const currentChannels = _.cloneDeep(myChannels);
    currentChannels.forEach(channelCard => {
      for (let i = 0; i < channelCard.channel.Memberships.length; i++) {
        if (channelCard.channel.Memberships[i].userId === payload.intra_login) {
          const localMembership = channelCard.channel.Memberships[i].user;
          if (payload.avatar) {
            localMembership.avatar = payload.avatar;
          }
          if (payload.nickname) {
            localMembership.nickname = payload.nickname;
          }
          if (payload.status) {
            localMembership.status = payload.status;
          }
        }
      }
    })
    setMyChannels(currentChannels)
  }, [myChannels]);

  const onChannelDeleted = useCallback(async (payload: { channelId: number }) => {
    const clonedChannels = _.cloneDeep(myChannels);

    const indexToRemove = _.findIndex(clonedChannels, { channelId: payload.channelId });

    if (indexToRemove !== -1) {
      clonedChannels.splice(indexToRemove, 1);
    }
    setActiveChannel(-1);
    setMyChannels(clonedChannels);
  }, [myChannels])
  useEffect(() => {
    fetchWrapper(router, fetchMyChannels)
      .then((e) => setMyChannels(e))
      .catch(() => setMyChannels([]));
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [socket, router]);

  useEffect(() => {
    socket.on('updateUser', updateUser)
    return () => { socket.off('updateUser', updateUser); }
  }, [socket, updateUser])
  useEffect(() => {
    socket.on("syncChannel", onSyncChannel);
    return () => { socket.off("syncChannel", onSyncChannel); };
  }, [socket, onSyncChannel]);
  useEffect(() => {
    socket.on("deleteChannel", onChannelDeleted);
    return () => { socket.off("deleteChannel", onChannelDeleted); };
  }, [socket, onChannelDeleted]);

  useEffect(() => {
    socket.on('leaveChannel', onLeaveChannel);
    return () => {
      socket.off('leaveChannel', onLeaveChannel)
    };
  }, [socket, onLeaveChannel]);

  useEffect(() => {
    socket.on("server_message", onServerMessage);
    return () => {
      socket.off("server_message", onServerMessage);
    };
  }, [socket, onServerMessage]);
  return (
    <ChatContext.Provider value={{ updateChannels: updateChannelCards, syncChannel: onSyncChannel }}>
      <Flex h="100%" alignItems={"stretch"}>
        <Flex
          flexDir={"column"}
          minW={"20vw"}
          bg="pongBlue.200"
          pt="1vh"
          pl="1vw"
          pr="1vw"
          overflowY="auto"
        >
          <Flex
            justifyContent={"space-between"}
            align={"center"}
            mb="1vh"
            borderRadius={5}
          >
            <Center>
              <Circle
                bg={online ? "green.300" : "gray.300"}
                size="2vh"
                mr="1vw"
              />
              <Text
                fontSize="xl"
                fontWeight={"bold"}
                letterSpacing={"wider"}
                color="white"
              >
                {online ? "Online" : "Offline"}
              </Text>
            </Center>
            <IconButton
              size="sm"
              aria-label="create new group"
              colorScheme="green"
              icon={<AddIcon />}
              onClick={onToggle}
            />
          </Flex>

          <Box display={isOpen ? 'block' : 'none'}>
            <Flex
              bg="pongBlue.500"
              borderRadius={5}
              flexDir={"column"}
              p="1.5vh 1vw"
            >
              <Heading color="gray.300" as="h6" size="xs">
                Channel Name:
              </Heading>
              <Input
                size="sm"
                mt="1"
                placeholder="Group name"
                borderRadius="md"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
              <Heading pt="1vh" color="gray.300" as="h6" size="xs">
                Password:
              </Heading>
              <Input
                size="sm"
                mt="1"
                borderRadius="md"
                placeholder="Password (optional)"
                type="password"
                value={groupPsw}
                onChange={(e) => setGroupPsw(e.target.value)}
              />
              <Flex justify={"space-around"} pb="1vh" pt="1vh">
                <Button
                  size="md"
                  colorScheme="green"
                  isDisabled={!Boolean(groupName) || loading}
                  onClick={createNewChannel}
                >
                  Confirm
                </Button>
                <Button
                  size="md"
                  colorScheme="yellow"
                  onClick={() => {
                    setGroupName("");
                    setGroupPsw("");
                    onClose();
                  }}
                >
                  Cancel
                </Button>
              </Flex>
            </Flex>
          </Box>
          <Stack overflow={"auto"}>
            {myChannels.map((e, i) => (
              <ChannelCard
                key={`ChannelCard-${e.channelId}`}
                {...e}
                onClick={() => setActiveChannel(i)}
                active={i === activeChannel}
              />
            ))}
          </Stack>
        </Flex>
        <Flex flexDir="column" justifyContent="space-between" w="100%">
          {activeChannel >= 0 ? (
            <MessageSection
              {...myChannels[activeChannel]}
              syncAll={updateChannelCards}
            />
          ) : (
            <Skeleton
              isLoaded={false}
              h="100%"
              speed={3}
              startColor="pongBlue.400"
              endColor="yellow.300"
            />
          )}
        </Flex>
      </Flex>
    </ChatContext.Provider>
  );
}

Chat.getLayout = function getLayoutPage(page: ReactElement) {
  return <PageLayout>{page}</PageLayout>;
};
