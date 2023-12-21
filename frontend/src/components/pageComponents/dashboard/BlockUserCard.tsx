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


interface BlockedRowProps {
  id: string;
  issuer_id: string;
  target_id: string;
  target_user: {
    nickname: string;
    avatar: string;
    intra_login: string;
    status: string;
    elo: number;
  };
  fetchAllBlockedUsersAgain: () => void;
}

function BlockedRow({ fetchAllBlockedUsersAgain, ...props }: BlockedRowProps ) {
    const color = props.target_user.status === "online" ? "green.300" : "gray.300";
    const [loading, setLoading] = useState(false);

    async function unblockUserRequest() {
      setLoading(true);
      try {
        await unblockUser( 
          props.issuer_id,
          props.target_id,
        );
        fetchAllBlockedUsersAgain();
      } catch (e) {
        console.warn("Could not unblock user");
      }
      setLoading(false);
    }

    return (
      <Flex w="100%"
      p="1vh 1vw"
      justifyContent="space-between"
      borderRadius={10}
      borderColor={"yellow.300"}
      borderWidth={2}>
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
        <Box>
        <Button
          isLoading={loading}
          colorScheme="red"
          onClick={unblockUserRequest}
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

    const fetchAllBlockedUsersAgain = useCallback(() => {
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
            <BlockedRow {...b} key={`BlockedLine-${b.target_id}`} fetchAllBlockedUsersAgain={fetchAllBlockedUsersAgain}/>
          ))}
        </VStack>
        </Flex>
        </>
    );
}