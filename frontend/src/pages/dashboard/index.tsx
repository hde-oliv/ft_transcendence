"use client";
import {
  PropsWithChildren,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from "react";
import PongPageMenu from "../../components/nav/PongNavBar";
import {
  Avatar,
  AvatarBadge,
  Box,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Center,
  Flex,
  Heading,
  Icon,
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
  StatGroup,
} from "@chakra-ui/react";
import { Grid, GridItem, Container } from "@chakra-ui/react";
import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { CheckIcon } from "@chakra-ui/icons";
import PageLayout from "@/components/pageLayout/PageLayout";
import { NextPageWithLayout } from "../_app";
import {
  createFriendship,
  getAllFriends,
  getFriendsById,
  getFriendsByUser,
} from "@/lib/fetchers/friends";
import { FriendCard } from "../../components/pageComponents/dashboard/FriendCard";
import { ChannelCard } from "../../components/pageComponents/dashboard/PublicChannelCard";
import PlayCard from "../../components/pageComponents/dashboard/PlayCard";

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

function HistoryCard(props: PropsWithChildren) {
  //limitar historico a 5 registros
  return (
    <Center flexDir="column" h="370px" w="370px">
      <Heading mb="1vh">History</Heading>
      <TableContainer>
        <Table size="sm">
          <Thead>
            <Tr bgColor="gray">
              <Th color="yellow.300">Won</Th>
              <Th color="yellow.300">Date</Th>
              <Th color="yellow.300">Adversary</Th>
              <Th color="yellow.300">Score</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>
                <CheckIcon />
              </Td>
              <Td>01/01/2010</Td>
              <Td>hde-camp</Td>
              <Td>8 | 0</Td>
            </Tr>
            <Tr>
              <Td>
                <CheckIcon />
              </Td>
              <Td>01/01/2010</Td>
              <Td>hde-camp</Td>
              <Td>8 | 0</Td>
            </Tr>
            <Tr>
              <Td>
                <CheckIcon />
              </Td>
              <Td>01/01/2010</Td>
              <Td>hde-camp</Td>
              <Td>8 | 0</Td>
            </Tr>
            <Tr>
              <Td>
                <CheckIcon />
              </Td>
              <Td>01/01/2010</Td>
              <Td>hde-camp</Td>
              <Td>8 | 0</Td>
            </Tr>
            <Tr>
              <Td>
                <CheckIcon />
              </Td>
              <Td>01/01/2010</Td>
              <Td>hde-camp</Td>
              <Td>8 | 0</Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
    </Center>
  );
}
function StatsCard(props: PropsWithChildren) {
  return (
    <Center flexDir="column" h="370px" w="370px">
      <Heading pb="2vw">Stats</Heading>
      <Wrap spacing="1vw">
        <Stat
          borderWidth="2px"
          borderRadius="lg"
          p="1vw 1vw"
          borderColor="yellow.200"
        >
          <StatLabel>Games</StatLabel>
          <StatNumber textAlign="center" color="yellow.300">
            20
          </StatNumber>
        </Stat>
        <Stat
          borderWidth="2px"
          borderRadius="lg"
          p="1vw 1vw"
          borderColor="yellow.200"
        >
          <StatLabel>Victories</StatLabel>
          <StatNumber textAlign="center" color="green.400">
            10
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
            10
          </StatNumber>
        </Stat>
      </Wrap>
    </Center>
  );
}
function ConfigsCard(props: PropsWithChildren) {
  return (
    <Center flexDir="column" h="370px" w="370px">
      <Heading>Configs</Heading>
    </Center>
  );
}

const Dashboard: NextPageWithLayout = () => {
  const router = useRouter();
  return (
    <Wrap p="5vh 5vw" spacing="30px" justify="center">
      <WrapItem borderRadius="30" borderWidth="2px" borderColor="yellow.400">
        <PlayCard />
      </WrapItem>
      <WrapItem borderRadius="30" borderWidth="2px" borderColor="yellow.400">
        <RankCard />
      </WrapItem>
      <WrapItem borderRadius="30" borderWidth="2px" borderColor="yellow.400">
        <HistoryCard />
      </WrapItem>
      <WrapItem borderRadius="30" borderWidth="2px" borderColor="yellow.400">
        <StatsCard />
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
