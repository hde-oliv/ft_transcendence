'use client'
import {
  ChannelData,
  promoteChannelAdmin,
  banFromChannel,
  fetchMessagesFromChannel,
  inviteUserToChannel,
  kickFromChannel,
  messageResponseSchema,
  muteInChannel,
  patchChannel,
  updateChannelSchema,
  unbanFromChannel,
  unmuteInChannel,
  demoteChannelAdmin,
} from "@/lib/fetchers/chat";
import {
  AddIcon,
  CloseIcon,
  DeleteIcon,
  EmailIcon,
  LockIcon,
  SettingsIcon,
  UnlockIcon,
} from "@chakra-ui/icons";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  PopoverAnchor,
  Portal,
  Wrap,
  Stat,
  StatLabel,
  StatNumber,
} from '@chakra-ui/react'

import {
  Avatar,
  AvatarBadge,
  Box,
  Button,
  Center,
  Checkbox,
  Collapse,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormLabel,
  HStack,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputRightAddon,
  Select,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Tooltip,
  VStack,
  useDisclosure
} from "@chakra-ui/react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  ChannelComponentProps,
  MessageCardProps,
  MessageCard,
  ChatContext,
} from "../../../pages/chat";
import z, { ZodError } from "zod";
import { ReturnUserSchema } from "@/lib/fetchers/users";
import diacriticalNormalize from "@/lib/diacriticalNormalize";
import { getAllFriends } from "@/lib/fetchers/friends";
import { MeStateContext, SocketContext } from "@/components/pageLayout/PageLayout";
import KickIcon from "@/components/icons/KickIcon";
import MuteIcon from "@/components/icons/MuteIcon";
import BanIcon from "@/components/icons/BanIcon";
import CrownIcon from "@/components/icons/CrownIcon";
import UndoIcon from "@/components/icons/UndoIcon";
import DowngradeIcon from "@/components/icons/DowngradeIcon";
import { inviteToPlay } from "@/lib/fetchers/invite";
import { fetchWrapper } from '@/lib/fetchers/SafeAuthWrapper';
import { useRouter } from "next/router";


function membersFromChannel(
  channel: ChannelData["channel"]
): Array<Omit<ReturnUserSchema, "elo">> {
  return channel.Memberships.map((e) => {
    return {
      status: e.user.status,
      avatar: e.user.avatar,
      intra_login: e.user.intra_login,
      nickname: e.user.nickname,
    };
  });
}
function membershipsFromChannel(channel: ChannelData["channel"]): ChannelData["channel"]["Memberships"] {
  return channel.Memberships.map((e) => {
    return {
      ...e
    };
  });
}

// TODO: add Membership type
function MemberRow(props: {
  owner: boolean, admin: boolean,
  membership: Omit<ChannelComponentProps, "channel"> & { user: Omit<ReturnUserSchema, 'elo'> };
  channel: ChannelData["channel"];
}) {
  const { membership, channel, owner, admin } = props;
  const user = membership.user;
  const [me] = useContext(MeStateContext);
  const { syncChannel } = useContext(ChatContext);
  const router = useRouter();
  const color = user.status === "online" ? "green.300" : "gray.300";


  return (
    <>
      <Divider />
      <Flex w="100%" p="1vh 1vw" justifyContent="space-between">
        <HStack>
          <Avatar src={user.avatar}>
            <AvatarBadge boxSize="1.25em" bg={color} />
          </Avatar>
          <Box display="inline-block">
            <Heading fontWeight="medium" size="md" pl="1vw">
              {user.nickname}
            </Heading>
            <Heading fontWeight="light" size="xs" pl="1vw">
              {user.intra_login}
            </Heading>
          </Box>
          {props.membership.owner ? (
            <Tooltip label="Owner">
              <Button size="xs">O</Button>
            </Tooltip>
          ) : (
            <></>
          )}
          {props.membership.administrator ? (
            <Tooltip label="Admin">
              <Button size="xs">A</Button>
            </Tooltip>
          ) : (
            <></>
          )}
        </HStack>
        {user.intra_login === me.intra_login ? (
          <></>
        ) : (
          <Center>
            <VStack mr="4">
              <Button
                rightIcon={membership.banned ? <UndoIcon boxSize={'1.5em'} /> : <BanIcon boxSize={'1.5em'} />}
                isDisabled={!(admin || owner)}
                colorScheme="red"
                size="sm"
                aria-label="ban user"
                minW={'8em'}
                maxW={'8em'}
                onClick={() => {
                  if (membership.banned) {
                    fetchWrapper(router, unbanFromChannel, props.channel.id, props.membership.userId).then(e => {
                      syncChannel({ channelId: props.channel.id });
                    }).catch(e => console.error(e))
                  } else {
                    fetchWrapper(router, banFromChannel, props.channel.id, props.membership.userId).then(e => {
                      syncChannel({ channelId: props.channel.id });
                    }).catch(e => console.error(e))
                  }
                }}
              >
                {membership.banned ? 'Unban' : 'Ban'}
              </Button>
              <Button
                rightIcon={<KickIcon boxSize={'2em'} />}
                minW={'8em'}
                maxW={'8em'}
                isDisabled={!(admin || owner) || membership.banned}
                colorScheme="green"
                size="sm"
                aria-label="kick user"
                onClick={() => {
                  fetchWrapper(router, kickFromChannel, props.channel.id, props.membership.userId).then(e => {
                    syncChannel({ channelId: props.channel.id });
                  }).catch(e => console.error(e))
                }}
              >
                Kick
              </Button>
            </VStack>
            <VStack>
              <Button
                rightIcon={<MuteIcon boxSize={'1.5em'} />}
                minW={'8em'}
                maxW={'8em'}
                isDisabled={!(admin || owner) || membership.banned}
                colorScheme="yellow"
                size="sm"
                aria-label="mute user"
                onClick={() => {
                  if (membership.muted) {
                    fetchWrapper(router, unmuteInChannel, props.channel.id, props.membership.userId).then(e => {
                      syncChannel({ channelId: props.channel.id });
                    }).catch(e => console.error(e))
                  } else {
                    fetchWrapper(router, muteInChannel, props.channel.id, props.membership.userId).then(e => {
                      syncChannel({ channelId: props.channel.id });
                    }).catch(e => console.error(e))
                  }
                }}
              >
                {membership.muted ? 'Unmute' : 'Mute'}
              </Button>
              <Tooltip label="Give Administrator powers to user">
                <Button
                  rightIcon={membership.administrator ? <DowngradeIcon boxSize={'1.8em'} /> : <CrownIcon boxSize={'1.8em'} />}
                  minW={'8em'}
                  maxW={'8em'}
                  isDisabled={!(admin || owner) || membership.banned}
                  colorScheme="blue"
                  size="sm"
                  aria-label="admin user"
                  onClick={() => {
                    if (membership.administrator) {
                      fetchWrapper(router, demoteChannelAdmin, props.channel.id, props.membership.userId).then(e => {
                        syncChannel({ channelId: props.channel.id });
                      }).catch(e => console.error(e))
                    } else {
                      fetchWrapper(router, promoteChannelAdmin, props.channel.id, props.membership.userId).then(e => {
                        syncChannel({ channelId: props.channel.id });
                      }).catch(e => console.error(e))
                    }
                  }}
                >
                  {membership.administrator ? 'Demote' : 'Admin'}
                </Button>
              </Tooltip>
            </VStack>
          </Center>
        )}
      </Flex>
    </>
  );
}

function GroupSettings(props: {
  membership: Omit<ChannelComponentProps, "channel">;
  channel: ChannelData["channel"];
  syncAll: () => void;
}) {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [editingPsw, setEditinPsw] = useState(false);
  const [pswOne, setPswOne] = useState("");
  const [pswTwo, setPswTwo] = useState("");
  const [channelType, setChannelType] = useState(props.channel.type);
  const [channelName, setChannelName] = useState(props.channel.name);
  const { updateChannels: updateChats } = useContext(ChatContext);
  const router = useRouter();

  const [me, setMe] = useContext(MeStateContext);

  const memberships = membershipsFromChannel(props.channel);

  useEffect(() => {
    setPswOne("");
    setPswTwo("");
    setChannelType(props.channel.type);
    setChannelName(props.channel.name);
  }, [props.channel.id, props.channel.type, props.channel.name]);

  if (props.channel.user2user) return undefined; // NOTE: Holy shit

  const pswError = pswOne !== "" && pswTwo !== "" && pswOne !== pswTwo;
  const pswDone = pswOne !== "" && pswTwo !== "" && pswOne === pswTwo;
  const pswDisable = props.channel.protected && !editingPsw;
  const canSave =
    channelName !== props.channel.name ||
    channelType !== props.channel.type ||
    pswDone ||
    pswDisable;

  async function saveConfig() {
    try {
      const updatedChannelConfig = updateChannelSchema.parse({
        name: channelName,
        type: channelType,
        password: pswDone ? pswOne : "",
        protected: pswDone,
      });
      await fetchWrapper(router, patchChannel, props.channel.id, updatedChannelConfig);
      updateChats();
      // props.syncAll();
    } catch (e) {
      if (e instanceof ZodError)
        console.warn("Error build patchChannel object");
    }
  }

  return (
    <Center>
      <IconButton
        colorScheme="yellow"
        size="lg"
        icon={<SettingsIcon />}
        aria-label="channel settings"
        onClick={onOpen}
      />
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        size={"lg"}
        colorScheme="yellow"
      >
        <DrawerOverlay />
        <DrawerContent bgColor={"pongBlue.200"}>
          <DrawerHeader>
            <HStack>
              <Text>Channel Settings &nbsp; </Text>
              {props.channel.protected ? <LockIcon /> : <UnlockIcon />}{" "}
            </HStack>
          </DrawerHeader>
          <DrawerBody>
            <FormLabel>Channel Name</FormLabel>
            <Input
              value={channelName}
              onChange={({ target }) => setChannelName(target.value)}
              isDisabled={!props.membership.owner}
              key="channelNameInput"
            />

            <FormLabel mt="2vh">Type</FormLabel>
            <Select
              isDisabled={!props.membership.owner}
              value={channelType}
              onChange={(e) =>
                setChannelType(e.target.value as "private" | "public")
              }
              key="channelTypeSelection"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </Select>
            <FormLabel mt="2vh">Password</FormLabel>
            <Checkbox
              display={"block"}
              ml="2vw"
              size="lg"
              isDisabled={!props.membership.owner}
              colorScheme="yellow"
              isChecked={editingPsw}
              onChange={(e) => {
                console.log(`value:${e.target.value}`);
                console.log(`checked:${e.target.checked}`);
                setEditinPsw(e.target.checked);
              }}
            />
            <Collapse in={editingPsw}>
              <Flex flexDir="column">
                <Input
                  isDisabled={!props.membership.owner}
                  key="pswOneInput"
                  placeholder="Type the new password"
                  type="password"
                  isInvalid={pswError}
                  value={pswOne}
                  onChange={(e) => setPswOne(e.target.value)}
                  borderColor={pswDone ? "green.300" : undefined}
                  mt="1vh"
                />
                <Input
                  isDisabled={!props.membership.owner}
                  key="pswTwoInput"
                  placeholder="Confirm the above password"
                  type="password"
                  isInvalid={pswError}
                  value={pswTwo}
                  onChange={(e) => setPswTwo(e.target.value)}
                  borderColor={pswDone ? "green.300" : undefined}
                  mt="1vh"
                />
              </Flex>
            </Collapse>
            <Flex justifyContent={"end"}>
              {pswDisable ? (
                <Heading
                  mr="2vw"
                  alignSelf={"center"}
                  size="sm"
                  color="red.300"
                >
                  This will disable password
                </Heading>
              ) : undefined}
              <Button
                mt="1vh"
                colorScheme="green"
                isDisabled={!props.membership.owner || !canSave}
                alignSelf={"end"}
                onClick={saveConfig}
              >
                Save
              </Button>
            </Flex>
            <MemberRow
              owner={props.membership.administrator}
              admin={props.membership.owner}
              key={`ch${props.channel.id}-${me.intra_login}`}
              membership={{
                ...props.membership,
                user: {
                  avatar: me.avatar,
                  intra_login: me.intra_login,
                  nickname: me.nickname,
                  status: "online",
                }
              }}
              channel={props.channel}
            />
            <Tabs
              isLazy={true}
              variant='solid-rounded'
              colorScheme="yellow">
              <TabList>
                <Tab>Members</Tab>
                <Tab>Admins</Tab>
                <Tab>Banned</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  {memberships.filter(e => !e.administrator && !e.owner && !e.banned).map((e) => {
                    let user = e.user
                    return (
                      <MemberRow
                        owner={props.membership.administrator}
                        admin={props.membership.owner}
                        key={`ch${props.channel.id}-${user.intra_login}`}
                        membership={{
                          administrator: e.administrator,
                          banned: e.banned,
                          channelId: e.channelId,
                          muted: e.muted,
                          owner: e.owner,
                          userId: e.userId,
                          user: e.user
                        }}
                        channel={props.channel}
                      />
                    )
                  })}
                </TabPanel>
                <TabPanel>
                  {memberships.filter(e => e.administrator || e.owner && !e.banned).map((e) => {
                    let user = e.user
                    return (
                      <MemberRow
                        owner={props.membership.administrator}
                        admin={props.membership.owner}
                        key={`ch${props.channel.id}-${user.intra_login}`}
                        membership={{
                          administrator: e.administrator,
                          banned: e.banned,
                          channelId: e.channelId,
                          muted: e.muted,
                          owner: e.owner,
                          userId: e.userId,
                          user: e.user
                        }}
                        channel={props.channel}
                      />
                    )
                  })}
                </TabPanel>
                <TabPanel>
                  {memberships.filter(e => e.banned).map((e) => {
                    let user = e.user
                    return (
                      <MemberRow
                        owner={props.membership.administrator}
                        admin={props.membership.owner}
                        key={`ch${props.channel.id}-${user.intra_login}`}
                        membership={{
                          administrator: e.administrator,
                          banned: e.banned,
                          channelId: e.channelId,
                          muted: e.muted,
                          owner: e.owner,
                          userId: e.userId,
                          user: e.user
                        }}
                        channel={props.channel}
                      />
                    )
                  })}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </DrawerBody>
          <DrawerFooter>
            <HStack>
              <IconButton
                size="lg"
                colorScheme="red"
                icon={<DeleteIcon />}
                isDisabled={!props.membership.owner}
                aria-label="delete channel"
              />
              {/* TODO: Implement channel delete only by owner */}
              <IconButton
                size="lg"
                colorScheme="yellow"
                icon={<CloseIcon />}
                onClick={onClose}
                aria-label="close channel settings"
              />
            </HStack>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Center>
  );
}

export function MessageSection(
  props: ChannelComponentProps & { syncAll: () => void },
): JSX.Element {
  const [messages, setMessages] = useState<Array<MessageCardProps>>([]);
  const router = useRouter()
  const socket = useContext(SocketContext);

  const [text, setText] = useState("");
  const messagesRef = useRef<HTMLDivElement>(null);
  const channelName = props.channel.user2user
    ? props.channel.Memberships[0].user.nickname
    : props.channel.name;

  // props.channel.user2user ? props.channel.Memberships[0] : undefined
  // const inviteUserToPlay = useCallback(async () => {// TODO fix, Membership[0] might not exist!
  // try {
  // await useAuthSafeFetch(router,inviteToPlay,props.channel.Memberships[0].user.intra_login);
  // } catch (e) {
  // console.log(e);
  // }
  // }, [props.channel.Memberships[0].user.intra_login]);

  const inviteUserToPlay = async () => {
    try{
      if(props.channel.Memberships.length !== 0){
        await fetchWrapper(router,inviteToPlay,props.channel.Memberships[0].user.intra_login);
      } 
    }catch (e) {
      console.log(e);
    }
  }; //TODO: this is a temp function to unbreak chat!

  async function send() {
    if (text === "") return;
    const message = {
      message: text,
      channelId: props.channelId,
    };
    if (socket) {
      if (socket.connected) {
        try {
          const response = await socket.emitWithAck(
            "channel_message",
            message,
          );
          setText("");
        } catch (e) {
          console.log(e); //TODO: make some king of popUp
        }
      } else console.log("Socket offline");
    }
  }
  function serverMessage(data: any) {
    const parsedData = messageResponseSchema.element.parse(data);
    if (parsedData.channel_id === props.channelId) {
      const tempMessages = [...messages, { ...parsedData, me: props.userId }];
      setMessages(tempMessages);
    }
  }
  useEffect(() => {
    socket.on("server_message", serverMessage);
    return () => {
      socket.off("server_message", serverMessage);
    };
  });
  useEffect(() => {
    fetchWrapper(router, fetchMessagesFromChannel, props.channelId)
      .then((e) => {
        setMessages(
          e.map((e) => {
            return { ...e, me: props.userId };
          }),
        );
      })
      .catch();
  }, [props.userId, props.channelId, router]);
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTo({
        behavior: "smooth",
        top: messagesRef.current.scrollHeight,
      });
    }
  }, [messages]);
  const cardData = dataFromProps();
  function dataFromProps() {
    if (props.channel.user2user) {
      const isOnline = props.channel.Memberships[0].user.status === 'online';
      if (props.channel.Memberships.length > 0) {
        return {
          avatar: props.channel.Memberships[0].user.avatar,
          intra_login: props.channel.Memberships[0].user.intra_login,
          nickname: props.channel.Memberships[0].user.nickname,
          statusColor: isOnline ? 'green.300' : 'gray',
        };
      } else {
        return {
          avatar: "",
          intra_login: "",
          nickname: props.channel.name,
          statusColor: 'gray',
        };
      }
    } else {
      return {
        avatar: "",
        intra_login: "",
        nickname: props.channel.name,
        statusColor: 'yellow',
      };
    }
  }

  return (
    <>
      <Flex bg="pongBlue.300" p="2vh 1vw" justify={"space-between"}>
        <Flex>
          <ProfilePopover channelName={channelName} {...props} cardData={cardData} inviteUserToPlay={inviteUserToPlay} />
          <Heading>{channelName}</Heading>
        </Flex>
        {props.channel.user2user ? (
          <>{/* TODO: Add here component to block the other user */}</>
        ) : (
          <HStack>
            <InviteMembers
              syncAll={props.syncAll}
              channel={props.channel}
              membership={{
                channelId: props.channelId,
                userId: props.userId,
                owner: props.owner,
                administrator: props.administrator,
                banned: props.banned,
                muted: props.muted,
              }}
            />
            <GroupSettings
              syncAll={props.syncAll}
              channel={props.channel}
              membership={{
                channelId: props.channelId,
                userId: props.userId,
                owner: props.owner,
                administrator: props.administrator,
                banned: props.banned,
                muted: props.muted,
              }}
            />
          </HStack>
        )}
      </Flex>
      <Box flexGrow={1} bg="pongBlue" overflowY="auto" ref={messagesRef}>
        <Stack p="1vh 2vw">
          {messages.map((m) => (
            <MessageCard {...m} key={`${m.id}`} />
          ))}
        </Stack>
      </Box>
      <Box flexGrow={0} bg="pongBlue.300" pl="2vw" pr="2vw" pt="1vh" pb="1vh">
        <InputGroup bg="pongBlue.500">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                send();
              }
            }}
          />
          <InputRightAddon>
            <EmailIcon onClick={send} focusable={true} />
          </InputRightAddon>
        </InputGroup>
      </Box>
    </>
  );
}

function ProfilePopover(props: {
  cardData: {
    avatar: string;
    intra_login: string;
    nickname: string;
    statusColor: string;
  };
  inviteUserToPlay: () => Promise<void>;
  channelName: string;
  channelId: number;
  userId: string;
  owner: boolean;
  administrator: boolean;
  banned: boolean;
  muted: boolean;
  channel: {
    type: "private" | "public";
    id: number;
    name: string;
    protected: boolean;
    user2user: boolean;
    Memberships:
    {
      channelId: number;
      userId: string;
      owner: boolean;
      administrator: boolean;
      banned: boolean;
      muted: boolean;
      id: number;
      user: {
        status: "offline" | "online";
        id: string;
        nickname: string;
        avatar: string;
        intra_login: string;
      };
    }[];
  };
} & { onClick?: (() => void) | undefined; lastMessage?: string | undefined; } & { syncAll: () => void; }) {
  //return (<Avatar mr="2vw" name={props.channelName} bg="yellow.300" />)
  if (props.channel.user2user || props.channel.Memberships.length === 0)
    return (
      <Popover>
        <PopoverTrigger>
          <Avatar
            mr="2vw"
            name={props.channelName}
            src={props.channel.Memberships[0].user.avatar} />
        </PopoverTrigger>
        <Portal>
          <PopoverContent bg='pongBlue.500'>
            <PopoverArrow bg='pongBlue.500' />
            <HStack>
              <Avatar
                mr="2vw"
                name={props.channelName}
                src={props.channel.Memberships[0].user.avatar}>
                <AvatarBadge bg={props.cardData.statusColor} boxSize={'1em'} borderWidth={'0.1em'} />
              </Avatar>
              <PopoverHeader>
                <Heading textAlign="center" fontWeight="medium" size="md" pl="1vw">
                  {props.channelName}
                </Heading>
              </PopoverHeader>
            </HStack>
            <PopoverCloseButton />
            <PopoverBody>
              <Button
                alignItems="center"
                colorScheme='green'
                onClick={props.inviteUserToPlay}
                isDisabled={props.channel.Memberships[0].user.status === 'offline'}
              >{props.channel.Memberships[0].user.status === 'offline' ? "Wait to invite" : "Invite to play"}
              </Button>
            </PopoverBody>
            <PopoverFooter>
              <Center flexDir="column" h="20%" w="100%">
                <Heading textAlign="center" fontWeight="medium" size="md" pl="1vw"> Stats of {props.channelName}</Heading>
                <Wrap spacing="1vw">
                  <Stat
                    borderWidth="2px"
                    borderRadius="md"
                    p="1vw 1vw"
                    borderColor="yellow.200"
                  >
                    <StatLabel>Games</StatLabel>
                    <StatNumber textAlign="center" color="yellow.300">
                      20
                    </StatNumber>
                  </Stat>
                  <Stat
                    borderWidth="2px"
                    borderRadius="md"
                    p="1vw 1vw"
                    borderColor="yellow.200"
                  >
                    <StatLabel>Victories</StatLabel>
                    <StatNumber textAlign="center" color="green.400">
                      10
                    </StatNumber>
                  </Stat>
                  <Stat
                    borderWidth="2px"
                    borderRadius="md"
                    p="1vw 1vw"
                    borderColor="yellow.200"
                  >
                    <StatLabel>Loses</StatLabel>
                    <StatNumber textAlign="center" color="red.400">
                      10
                    </StatNumber>
                  </Stat>
                </Wrap>
              </Center>
            </PopoverFooter>
          </PopoverContent>
        </Portal>
      </Popover>
    );
}

export function InviteMembers(props: {
  membership: Omit<ChannelComponentProps, "channel">;
  channel: ChannelData["channel"];
  syncAll: () => void;
}) {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [text, setText] = useState("");
  const [me] = useContext(MeStateContext);
  const router = useRouter();

  const [friends, setFriends] = useState<Array<ReturnUserSchema>>([]);

  const [visibleUsers, setVisibleUsers] = useState<
    Array<Omit<ReturnUserSchema, "elo">>
  >([]);

  useEffect(() => {
    if (isOpen) {
      fetchWrapper(router, getAllFriends)
        .then((e) =>
          setFriends(e.filter((e) => e.intra_login !== me.intra_login)),
        )
        .catch((e) => console.log(e));
    }
  }, [isOpen, me, props.channel.id, router]);

  const visibleUserCallback = useCallback(() => {
    const members = membersFromChannel(props.channel);
    const notMemberFriends = friends.filter((e) => {
      return !members.some((f) => f.intra_login === e.intra_login);
    });
    let filteredNonMembers;
    if (text !== "") {
      let inputFilteredUsers: Array<Omit<ReturnUserSchema, "elo">> =
        notMemberFriends.filter((e) => {
          let filter = diacriticalNormalize(text.toLocaleLowerCase());
          return (
            diacriticalNormalize(e.nickname.toLocaleLowerCase()).includes(
              filter,
            ) ||
            diacriticalNormalize(e.intra_login.toLocaleLowerCase()).includes(
              filter,
            )
          );
        });
      filteredNonMembers = inputFilteredUsers.map((e) => {
        return {
          ...e,
        };
      });
    } else {
      filteredNonMembers = notMemberFriends;
    }
    setVisibleUsers(filteredNonMembers);
  }, [text, friends, props.channel]);

  useEffect(visibleUserCallback, [visibleUserCallback]);

  return (
    <Center>
      <IconButton
        colorScheme="yellow"
        size="lg"
        icon={<AddIcon />}
        aria-label="channel settings"
        onClick={onOpen}
      />
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        size={"lg"}
        colorScheme="yellow"
      >
        <DrawerOverlay />
        <DrawerContent bgColor={"pongBlue.200"}>
          <DrawerHeader>Invite Friends </DrawerHeader>
          <DrawerBody>
            <Flex m="5" flexDir={"column"} h="70vh" overflow={"hidden"}>
              <HStack>
                <Input
                  value={text}
                  minH={"2.5em"}
                  onChange={(e) => setText(e.target.value)}
                  bg="pongBlue.300"
                  placeholder="Type a nickname or intra login"
                  aria-label="Filter members input"
                />
                <IconButton
                  colorScheme="yellow"
                  icon={<CloseIcon />}
                  onClick={() => setText("")}
                  aria-label="clear filter input"
                />
              </HStack>
              <Stack overflow={"auto"} mt="1vh">
                {visibleUsers.map((e) => (
                  <InviteUserCard
                    userData={e}
                    channelId={props.channel.id}
                    key={`addChannelMember-${e.intra_login}`}
                    sync={props.syncAll}
                  />
                ))}
                {visibleUsers.length === 0 ? (
                  <Center>
                    <Heading color="red.400">No User Found</Heading>
                  </Center>
                ) : undefined}
              </Stack>
            </Flex>
          </DrawerBody>
          <DrawerFooter>
            <IconButton
              size="lg"
              colorScheme="yellow"
              icon={<CloseIcon />}
              onClick={onClose}
              aria-label="close channel settings"
            />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Center>
  );
}

function InviteUserCard(props: {
  userData: Omit<ReturnUserSchema, "elo">;
  channelId: number;
  sync: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function addFriend() {
    setLoading(true);
    try {
      await fetchWrapper(router, inviteUserToChannel, {
        channelId: props.channelId,
        userId: props.userData.intra_login,
      });
      props.sync();
    } catch (e) {
      console.warn(`Could add ${props.userData.nickname} to channel.`);
    }
    setLoading(false);
  }

  return (
    <Flex
      w="100%"
      p="1vh 1vw"
      justifyContent="space-between"
      borderRadius={10}
      borderColor={"yellow.300"}
      borderWidth={2}
    >
      <Box w="50%">
        <Avatar src={props.userData.avatar}>
          <AvatarBadge boxSize="1.25em" bg={"green.300"} />
        </Avatar>
        <Box display="inline-block">
          <Heading fontWeight="medium" size="md" pl="1vw">
            {props.userData.nickname}
          </Heading>
          <Heading fontWeight="light" size="xs" pl="1vw">
            {props.userData.intra_login}
          </Heading>
        </Box>
      </Box>
      <Center>
        <Button isLoading={loading} colorScheme="green" onClick={addFriend}>
          Add
        </Button>
      </Center>
    </Flex>
  );
}
/*
   <Popover>
     <>{ Profile PopOver }</>
     <PopoverTrigger>
     <Avatar
     mr="2vw"
     name={channelName}
     src={props.channel.Memberships[0].user.avatar}
     />
     </PopoverTrigger>
     <Portal>
     <PopoverContent bg='pongBlue.500'>
     <PopoverArrow bg='pongBlue.500' />
     <HStack>
       <Avatar
       mr="2vw"
       name={channelName}
       src={props.channel.Memberships[0].user.avatar}>
       <AvatarBadge bgprops.={cardData.statusColor} boxSize={'1em'} borderWidth={'0.1em'} />
       </Avatar>
       <PopoverHeader>
       <Heading textAlign="center" fontWeight="medium" size="md" pl="1vw">
       {channelName}
       </Heading>
       </PopoverHeader>
     </HStack>
     <PopoverCloseButton />
     <PopoverBody>
       <Button
       colorScheme='green'
       isDisabled={props.channel.Memberships[0].user.status === 'offline'}
       >{props.channel.Memberships[0].user.status === 'offline' ? "Wait to invite" : "Invite to play"}
       </Button>
     </PopoverBody>
     <PopoverFooter>
     <Center flexDir="column" h="20%" w="100%">
       <Heading textAlign="center" fontWeight="medium" size="md" pl="1vw" > Stats of {channelName}</Heading>
       <Wrap spacing="1vw">
       <Stat
       borderWidth="2px"
       borderRadius="md"
       p="1vw 1vw"
       borderColor="yellow.200"
       >
       <StatLabel>Games</StatLabel>
       <StatNumber textAlign="center" color="yellow.300">
       20
       </StatNumber>
       </Stat>
       <Stat
       borderWidth="2px"
       borderRadius="md"
       p="1vw 1vw"
       borderColor="yellow.200"
       >
       <StatLabel>Victories</StatLabel>
       <StatNumber textAlign="center" color="green.400">
       10
       </StatNumber>
       </Stat>
       <Stat
       borderWidth="2px"
       borderRadius="md"
       p="1vw 1vw"
       borderColor="yellow.200"
       >
       <StatLabel>Loses</StatLabel>
       <StatNumber textAlign="center" color="red.400">
       10
       </StatNumber>
       </Stat>
       </Wrap>
     </Center>
     </PopoverFooter>
     </PopoverContent>
     </Portal>
   </Popover>

*/
