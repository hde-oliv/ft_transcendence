"use client";
import {
  Avatar,
  AvatarBadge,
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
import { MeResponseData, getMe } from "@/lib/fetchers/me";
import {ReturnAllBlockedUsersResponse, fetchAllBlockedUsers, unblockUser} from "@/lib/fetchers/chat";


function BlockedRow(props: ReturnAllBlockedUsersResponse) {
    const color = props.target_user.status === "online" ? "green.300" : "gray.300";
    return (
      <Flex w="100%" pl="1vw" pr="1vw" justifyContent="space-between">
        <Box>
          <Avatar src={props.target_user.avatar}>
            <AvatarBadge boxSize="1.25em" bg={color} />
          </Avatar>
          <Box display="inline-block">
            <Heading fontWeight="medium" size="md" pl="1vw">
              {props.target_user.nickname}
            </Heading>
            <Heading fontWeight="light" size="xs" pl="1vw">
              {props.target_user.intra_login}
            </Heading>
          </Box>
        </Box>
        <Box display="inline-block">
          <Heading fontWeight="medium" size="md" pl="1vw">
            Elo
          </Heading>
          <Heading fontWeight="light" size="xs" pl="1vw">
            {props.target_user.elo}
          </Heading>
        </Box>
        <Box>
        <Button
          colorScheme="red"
          >
          Unblock
        </Button>
        </Box>
      </Flex>
    );
  }

export function BlockUserCard() {
    const [allBlocked, setAllBlocked] = useState<Array<ReturnAllBlockedUsersResponse>>([]);
    const [me, setMe] = useState<MeResponseData | null>(null);

    useEffect(() => {
        if (me === null) {
          getMe()
            .then((e) => setMe(e))
            .catch((e) => setMe(null));
        }
    });

    useEffect(() => {
      fetchAllBlockedUsers()
        .then((e) => {
          console.log('Response:', e);
          setAllBlocked(e);
        })
        .catch((e) => {
          console.error('Error:', e);
        });
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
            Blocked Users
            </Heading>
        <VStack overflow={"auto"}>
            {allBlocked.map((b) => (
            <BlockedRow {...b} key={`BlockedLine-${b.target_id}`} />
          ))}
        </VStack>
        </Flex>
        </>
    );
}