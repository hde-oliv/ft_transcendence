import { ChannelData, fetchChannelUsers } from "@/lib/fetchers/chat";
import { FetchChannelUsers } from "@/lib/fetchers/chat";
import { Avatar, Box, Flex, Heading, Skeleton, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { ChannelComponentProps, userSchema } from "../../../pages/wppChat";

export function ChannelCard(
	props: ChannelComponentProps & { active: boolean }
) {
	// const [cardData, setCardData] = useState<userSchema>(dataFromProps());
	// const channelData = props.channel;
	// const channelMembers = props.channel.Memberships.map(e => e.user);
	const cardData = dataFromProps();
	function dataFromProps() {
		if (props.channel.user2user) {
			return {
				avatar: props.channel.Memberships[0].user.avatar,
				intra_login: props.channel.Memberships[0].user.intra_login,
				nickname: props.channel.Memberships[0].user.nickname,
				status: props.channel.Memberships[0].user.status,
			};
		} else {
			return {
				avatar: "",
				intra_login: "",
				nickname: props.channel.name,
				status: "online",
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
			<Avatar src={cardData.avatar} maxW="30%" />
			<Box pr="5%" pl="5%" maxW="70%">
				<Heading
					as="h6"
					size="xs"
					overflow="hidden"
					textOverflow="ellipsis"
					letterSpacing={"widest"}
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
