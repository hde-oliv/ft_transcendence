"use client";
import {
  Avatar,
  AvatarBadge,
  Box,
  Flex,
  Heading,
  VStack,
} from "@chakra-ui/react";
import { ReturnUserSchema } from "@/lib/fetchers/users";
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
