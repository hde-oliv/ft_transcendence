import { CloseIcon } from "@chakra-ui/icons"
import { Center, Flex, HStack, Heading, IconButton, Input, Stack } from "@chakra-ui/react"
import { useCallback, useContext, useState } from "react";
import { ReturnUserSchema } from "@/lib/fetchers/users";
import diacriticalNormalize from "@/lib/diacriticalNormalize";
import { MeStateContext } from "@/components/pageLayout/PageLayout";
import { UserCard, UserCardData } from "./FriendCard";



const AllUsersTab: React.FC<{ allUsers: UserCardData[], syncFriends: () => void, syncBlocked: () => void }> = (props) => {
  const [text, setText] = useState("");
  const visibleUserCallback = useCallback(() => {
    if (text !== "") {
      let withoutMe: Array<ReturnUserSchema> = [
        ...props.allUsers.filter((e) => {
          let filter = diacriticalNormalize(text.toLocaleLowerCase());
          return (
            diacriticalNormalize(e.nickname.toLocaleLowerCase()).includes(
              filter,
            ) ||
            diacriticalNormalize(e.intra_login.toLocaleLowerCase()).includes(
              filter,
            )
          );
        }),
      ];
      return withoutMe;
    }
    return props.allUsers;
  }, [text, props.allUsers]);
  return (
    <Flex
      flexDir="column"
      h="370px"
      w="370px"
      alignItems="stretch"
      pl="1vw"
      pr="1vw"
    >
      <HStack>
        <Input
          value={text}
          minH={"2.5em"}
          onChange={(e) => setText(e.target.value)}
          bg="pongBlue.300"
          placeholder="Type a nickname or intra login"
        />
      </HStack>
      <Stack overflow={"auto"} mt="1vh">
        {visibleUserCallback().map((e) => (
          <UserCard
            userData={e}
            key={`addFriend-${e.intra_login}`}
            syncBlocked={props.syncBlocked}
            syncFriends={props.syncFriends}
          />
        ))}
        {visibleUserCallback().length === 0 ? (
          <Center>
            <Heading color="red.400">No User Found</Heading>
          </Center>
        ) : undefined}
      </Stack>
    </Flex>
  )
}

export default AllUsersTab
