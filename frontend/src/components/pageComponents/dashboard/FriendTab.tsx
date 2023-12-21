"use client";
import {
  Avatar,
  AvatarBadge,
  Box,
  Button,
  Center,
  Flex,
  HStack,
  Heading,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { AddIcon, CloseIcon } from "@chakra-ui/icons";
import { ReturnUserSchema, fetchUsers } from "@/lib/fetchers/users";
import { useCallback, useContext, useEffect, useState } from "react";
import diacriticalNormalize from "@/lib/diacriticalNormalize";
import { createFriendship, getAllFriends } from "@/lib/fetchers/friends";
import { MeResponseData, getMe } from "@/lib/fetchers/me";
import { blockUser } from "@/lib/fetchers/chat";
import { MeStateContext } from "@/components/pageLayout/PageLayout";
import { UserCardData } from "./FriendCard";

export function ContactRow(props: ReturnUserSchema) {
  const color = props.status === "online" ? "green.300" : "gray.300";
  return (
    <Flex w="100%" pl="1vw" pr="1vw" justifyContent="space-between">
      <Box>
        <Avatar src={props.avatar}>
          <AvatarBadge boxSize="1.25em" bg={color} />
        </Avatar>
        <Box display="inline-block">
          <Heading fontWeight="medium" size="md" pl="1vw">
            {props.nickname}
          </Heading>
          <Heading fontWeight="light" size="xs" pl="1vw">
            {props.intra_login}
          </Heading>
        </Box>
      </Box>
      <Box display="inline-block">
        <Heading fontWeight="medium" size="md" pl="1vw">
          Elo
        </Heading>
        <Heading fontWeight="light" size="xs" pl="1vw">
          {props.elo}
        </Heading>
      </Box>
    </Flex>
  );
}


export const FriendTab: React.FC<{ friends: UserCardData[] }> = (props) => {
  const { friends } = props;

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
        <VStack overflow={"auto"} h='100%'>
          {friends.map((f) => (
            <ContactRow {...f} key={`friendLine-${f.intra_login}`} />
          ))}
        </VStack>
      </Flex>
    </>
  );
}
