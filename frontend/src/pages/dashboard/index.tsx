"use client";
import {
  FC,
  PropsWithChildren,
  ReactElement,
  useEffect,
  useState,
} from "react";
import {
  Center,
  Heading,
  Skeleton,
  Text,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import {
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import PageLayout from "@/components/pageLayout/PageLayout";
import { NextPageWithLayout } from "../_app";
import { ChannelCard } from "../../components/pageComponents/dashboard/PublicChannelCard";
import PlayCard from "../../components/pageComponents/dashboard/PlayCard";
import FriendCard from "@/components/pageComponents/dashboard/FriendCard";
import { fetchWrapper } from "@/lib/fetchers/SafeAuthWrapper";
import {
  HistoryRecord,
  UserStats,
  myHistory,
  myStats,
} from "@/lib/fetchers/matches";
import { HistoryCard } from "@/components/pageComponents/dashboard/HistoryCard";

function RankCard(props: PropsWithChildren) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => {
      clearTimeout(timer);
    };
  }, []);
  return (
    <Skeleton borderRadius="30" isLoaded={!loading}>
      <Center h="370px" w="370px">
        <Stat pl="1vw">
          <StatLabel fontSize="lg" fontWeight="bold">
            Rank
          </StatLabel>
          <StatNumber fontSize="3xl" textAlign="center">
            1
          </StatNumber>
          <StatHelpText textAlign="center" fontSize="md"></StatHelpText>
          <StatLabel fontSize="lg" fontWeight="bold">
            Points
          </StatLabel>
          <StatNumber fontSize="3xl" textAlign="center">
            50
          </StatNumber>
          <StatHelpText textAlign="center" fontSize="md">
            <StatArrow type="increase"></StatArrow>
            50
          </StatHelpText>
        </Stat>
      </Center>
    </Skeleton>
  );
}

export const StatsCard: FC<UserStats> = (props) => {
  return (
    <Center flexDir="column" h="370px" w="370px">
      <Heading mb="1vw">Stats</Heading>
      <Wrap spacing="1vw">
        <Stat
          borderWidth="2px"
          borderRadius="lg"
          p="1vw 1vw"
          borderColor="yellow.200"
        >
          <StatLabel>Victories</StatLabel>
          <StatNumber textAlign="center" color="green.400">
            {props.win}
          </StatNumber>
        </Stat>
        <Stat
          borderWidth="2px"
          borderRadius="lg"
          p="1vw 1vw"
          borderColor="yellow.200"
        >
          <StatLabel>Loses</StatLabel>
          <StatNumber textAlign="center" color="red.400">
            {props.loss}
          </StatNumber>
        </Stat>
        <Stat
          borderWidth="2px"
          borderRadius="lg"
          p="1vw 1vw"
          borderColor="yellow.200"
        >
          <StatLabel>Games</StatLabel>
          <StatNumber textAlign="center" color="yellow.300">
            {(props.loss + props.tie + props.win).toFixed(0)}
          </StatNumber>
        </Stat>
      </Wrap>
    </Center>
  );
};
function ConfigsCard(props: PropsWithChildren) {
  return (
    <Center flexDir="column" h="370px" w="370px">
      <Heading>Configs</Heading>
    </Center>
  );
}

const Dashboard: NextPageWithLayout = () => {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [stats, setStats] = useState<any>();
  useEffect(() => {
    fetchWrapper(router, myHistory)
      .then((e) => setHistory(e))
      .catch((e) => console.error(e));
    fetchWrapper(router, myStats)
      .then((e) => setStats(e))
      .catch((e) => console.error(e));
  }, [router]);
  return (
    <Wrap p="5vh 5vw" spacing="30px" justify="center">
      <WrapItem borderRadius="30" borderWidth="2px" borderColor="yellow.400">
        <PlayCard />
      </WrapItem>
      <WrapItem borderRadius="30" borderWidth="2px" borderColor="yellow.400">
        <RankCard />
      </WrapItem>
      <WrapItem borderRadius="30" borderWidth="2px" borderColor="yellow.400">
        <HistoryCard matches={history} />
      </WrapItem>
      <WrapItem borderRadius="30" borderWidth="2px" borderColor="yellow.400">
        <StatsCard {...stats} />
      </WrapItem>
      <WrapItem borderRadius="30" borderWidth="2px" borderColor="yellow.400">
        <FriendCard />
      </WrapItem>
      <WrapItem borderRadius="30" borderWidth="2px" borderColor="yellow.400">
        <ChannelCard />
      </WrapItem>
    </Wrap>
  );
};

Dashboard.getLayout = function getLayoutPage(page: ReactElement) {
  return <PageLayout>{page}</PageLayout>;
};

export default Dashboard;
