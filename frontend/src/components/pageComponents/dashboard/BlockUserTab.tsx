"use client";
import {
  Avatar,
  AvatarBadge,
  Box,
  Button,
  Flex,
  Heading,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { MeResponseData } from "@/lib/fetchers/me";
import { ReturnAllBlockedUsersResponse, unblockUser } from "@/lib/fetchers/chat";
import { useRouter } from "next/router";
import { useAuthSafeFetch } from "@/lib/fetchers/SafeAuthWrapper";



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
  syncBlocked: () => void;
}

function BlockedRow({ ...props }: BlockedRowProps) {
  const color = props.target_user.status === "online" ? "green.300" : "gray.300";
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function unblockUserRequest() {
    setLoading(true);
    try {
      await useAuthSafeFetch(router, unblockUser, props.target_id);
      props.syncBlocked()
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

export default function BlockUserTab(props: { users: ReturnAllBlockedUsersResponse[], syncBlocked: () => void }) {
  const [allBlocked, setAllBlocked] = useState<Array<ReturnAllBlockedUsersResponse>>([]);
  const [me, setMe] = useState<MeResponseData | null>(null);


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
          {props.users.map((b) => (
            <BlockedRow {...b} key={`BlockedLine-${b.target_id}`} syncBlocked={props.syncBlocked} />
          ))}
        </VStack>
      </Flex>
    </>
  );
}
