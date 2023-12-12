"use client";
import { CheckIcon, EditIcon } from "@chakra-ui/icons";
import { Heading, IconButton, Input } from "@chakra-ui/react";
import { Flex, Text, Box, useDisclosure, Collapse } from "@chakra-ui/react";
import { useContext, useState } from "react";
import { updateMe } from "@/lib/fetchers/me";
import { userData } from "../../../pages/account";
import { MeStateContext } from "@/components/pageLayout/PageLayout";

type UserNickSegmentProps = userData & {
  updateNickName: (str: string) => void;
};
export function UserNickSegment(props: UserNickSegmentProps): JSX.Element {
  const { onOpen, onClose, isOpen } = useDisclosure();
  const [newNick, setNewNick] = useState("");
  const [loading, setLoading] = useState(false);
  const [me, syncMe] = useContext(MeStateContext);

  async function saveNewNick() {
    const params = {
      intra_login: props.forthyTwoTag,
      nickname: newNick,
    };
    setLoading(true);
    try {
      if (await updateMe(params)) {
        props.updateNickName(newNick);
        setLoading(false)
        onClose();
        syncMe();
      } else {
        console.log("failed to update nickname");
        setTimeout(() => {
          setLoading(false);
        }, 200);
      }
    } catch (e) {
      console.log(e);
      setTimeout(() => {
        setLoading(false);
      }, 200);
    }
  }
  return (
    <>
      <Flex justifyContent="space-between" alignItems="stretch">
        <Box flexGrow={1}>
          <Heading pl="1vw" size="sm">
            Nickname{" "}
          </Heading>
          <Text pl="2vw">{props.nickname}</Text>
        </Box>
        <IconButton
          colorScheme="yellow"
          aria-label="edit"
          minW="5vw"
          w="5vw"
          onClick={isOpen ? onClose : onOpen}
          icon={<EditIcon />}
        />
      </Flex>
      <Collapse in={isOpen}>
        <Flex pl="2vw">
          <Input
            flexGrow={1}
            placeholder="New Nickname"
            bg="pongBlue.800"
            borderRightRadius={0}
            value={newNick}
            isDisabled={loading}
            onChange={(e) => {
              setNewNick(e.target.value);
            }}
          />
          <IconButton
            colorScheme="green"
            aria-label="save-new-nickname"
            borderLeftRadius={0}
            minW="5vw"
            w="5vw"
            isDisabled={newNick.length === 0 || loading}
            onClick={saveNewNick}
            icon={<CheckIcon />}
          />
        </Flex>
      </Collapse>
    </>
  );
}
