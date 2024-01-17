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
  Flex,
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
  Rank,
  UserStats,
  myHistory,
  myRank,
  myStats,
} from "@/lib/fetchers/matches";
import { HistoryCard } from "@/components/pageComponents/dashboard/HistoryCard";

const RankCard: FC<Rank & { loaded: boolean } | any> = (props) => {

  if (props === undefined || !props.loaded)
    return (
      <Skeleton borderRadius="30" isLoaded={false}>
        <Center h="370px" w="370px"></Center>
      </Skeleton>)
  return (
    <Skeleton borderRadius="30" isLoaded={props !== undefined}>
      <Flex h="370px" w="370px" flexDir={'column'} pt='2em'>
        <Stat pl="1vw">
          <StatLabel fontSize="lg" fontWeight="bold" pl='2em'>
            Rank
          </StatLabel>
          <StatNumber fontSize="3xl" textAlign="center">
            {props.rank}
          </StatNumber>
          <StatLabel fontSize="lg" fontWeight="bold" pl='2em'>
            Elo Points
          </StatLabel>
          <StatNumber fontSize="3xl" textAlign="center">
            {props.elo}
          </StatNumber>
          <StatHelpText textAlign="center" fontSize="md">
            <StatArrow type={props.variation < 0 ? 'decrease' : 'increase'}></StatArrow>
            {props.variation}&nbsp;pts (last 10 minutes)
          </StatHelpText>
        </Stat>
      </Flex>
    </Skeleton>
  );
}

export const StatsCard: FC<UserStats> = (props) => {

  if (props === undefined || props.indeterminate === undefined)
    return (
      <Skeleton borderRadius="30" isLoaded={false}>
        <Center h="370px" w="370px"></Center>
      </Skeleton>)
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

const Dashboard: NextPageWithLayout = () => {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [rank, setRank] = useState<Rank | undefined>(undefined);
  const [stats, setStats] = useState<any>();
  useEffect(() => {
    fetchWrapper(router, myHistory)
      .then((e) => setHistory(e))
      .catch((e) => console.error(e));
    fetchWrapper(router, myStats)
      .then((e) => setStats(e))
      .catch((e) => console.error(e));
    fetchWrapper(router, myRank)
      .then((e) => setRank(e))
      .catch((e) => { console.error(e); setRank(undefined); });
  }, [router]);
  return (
    <Wrap p="5vh 5vw" spacing="30px" justify="center">
      <WrapItem borderRadius="30" borderWidth="2px" borderColor="yellow.400">
        <PlayCard />
      </WrapItem>
      <WrapItem borderRadius="30" borderWidth="2px" borderColor="yellow.400">
        <RankCard {...rank} loaded={rank !== undefined} />
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
