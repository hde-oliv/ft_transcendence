import { Avatar, AvatarBadge, Box, Flex, Heading, Text } from "@chakra-ui/react";
import { ChannelComponentProps, userSchema } from "../../../pages/chat";

export function ChannelCard(
  props: ChannelComponentProps & { active: boolean },
) {
  // const [cardData, setCardData] = useState<userSchema>(dataFromProps());
  // const channelData = props.channel;
  // const channelMembers = props.channel.Memberships.map(e => e.user);
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
    <Flex
      bg={props.active ? "yellow.400" : "pongBlue.300"}
      padding="1vw 1vw"
      borderRadius="10"
      borderStyle="solid"
      borderColor="yellow.500"
      borderWidth={2}
      justifyContent="flex-start"
      maxW="20vw"
      onClick={props.onClick}
    >
      <Avatar name={cardData.nickname} src={cardData.avatar} maxW="30%" >
        <AvatarBadge bg={cardData.statusColor} boxSize={'1em'} borderWidth={'0.1em'} />
      </Avatar>
      <Box pr="5%" pl="5%" maxW="70%">
        <Heading
          as="h6"
          size="sm"
          overflow="hidden"
          textOverflow="ellipsis"
          letterSpacing={"wider"}
          textColor={props.active ? "black" : "gray.300"}
        >
          {cardData.nickname}
        </Heading>
        <Text
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
          textColor={props.active ? "black" : "gray.300"}
        >
          {props.lastMessage ? props.lastMessage : ""}
        </Text>
      </Box>
    </Flex>
  );
}
