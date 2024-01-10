"use client";
import PageLayout, { MeStateContext } from "@/components/pageLayout/PageLayout";
import {
  AttachmentIcon,
  CheckIcon,
  CloseIcon,
  EditIcon,
  LockIcon,
  UnlockIcon,
} from "@chakra-ui/icons";
import {
  HistoryRecord,
  UserStats,
  getUserStats,
  myHistory,
  myStats,
  userHistory,
} from "@/lib/fetchers/matches";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Center,
  Collapse,
  Heading,
  IconButton,
  StackDivider,
} from "@chakra-ui/react";
import {
  Flex,
  Stack,
  Text,
  Avatar,
  AvatarBadge,
  Box,
  useDisclosure,
} from "@chakra-ui/react";
import {
  ChangeEvent,
  ReactElement,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { ActivateTPOModal } from "../../components/pageComponents/account/ActivateTPOModal";
import { getMe, updateMe } from "@/lib/fetchers/me";
import { DisableTPOModal } from "../../components/pageComponents/account/DisableTPOModal";
import { UserNickSegment } from "../../components/pageComponents/account/UserNickSegment";
import { fetchWrapper } from "@/lib/fetchers/SafeAuthWrapper";
import { useRouter } from "next/router";
import { fetchUserById } from "@/lib/fetchers/users";
import { HistoryCard } from "@/components/pageComponents/dashboard/HistoryCard";
import { StatsCard } from "../dashboard";

export const ModalContext = createContext<() => void>(() => {}); //used by Modals of this page

export type userData = {
  nickname: string;
  avatar: string;
  intra_login: string;
  status: string;
  elo: number;
};

type AvatarEditProps = userData & {
  updateAvatar: (str: string) => void;
};

function ProfileAvatar(props: AvatarEditProps): JSX.Element {
  const { avatar, updateAvatar: setAvatar, intra_login: intraTag } = props;
  const [tempAvatar, setTempAvatar] = useState(avatar);

  return <></>;
}

export default function Profile(props: any) {
  const router = useRouter();
  const [userData, setUserData] = useState<undefined | userData>(undefined);
  const userId = router.query.id ?? undefined;

  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [stats, setStats] = useState<any>();

  useEffect(() => {
    if (typeof userId === "string") {
      fetchWrapper(router, userHistory, userId)
        .then((e) => setHistory(e))
        .catch((e) => console.error(e));
      fetchWrapper(router, getUserStats, userId)
        .then((e) => setStats(e))
        .catch((e) => console.error(e));
    }
  }, [router, userId, router.query.id]);

  useEffect(() => {
    (async () => {
      if (typeof userId === "string") {
        try {
          const ftData = await fetchWrapper(router, fetchUserById, userId);
          let tmp: userData = {
            intra_login: ftData.intra_login,
            avatar: ftData.avatar,
            nickname: ftData.nickname,
            status: ftData.status,
            elo: ftData.elo,
          };
          setUserData(tmp);
        } catch (e) {
          console.log(e);
        }
      } else {
        setUserData(undefined);
      }
    })();
  }, [userId, router, router.query.id]);

  if (!userData) return <Center></Center>;

  return (
    <Center pt="2vh">
      <Flex flexDir="column">
        <Card bg="pongBlue.500">
          <CardHeader w="80vw">
            <Heading textAlign="center">User details</Heading>
          </CardHeader>
          <CardBody>
            <Stack divider={<StackDivider />} pl="20%" pr="20%">
              <Flex justify="center" pb="2vh">
                <Avatar size="2xl" src={userData.avatar}>
                  <AvatarBadge border="none" bg="transparent"></AvatarBadge>
                </Avatar>
              </Flex>
              <Box>
                <Heading pl="1vw" size="sm">
                  Intra Tag{" "}
                </Heading>
                <Text pl="2vw">{userData.intra_login}</Text>
              </Box>
              <Flex justifyContent="space-between" alignItems="stretch">
                <Box flexGrow={1}>
                  <Heading pl="1vw" size="sm">
                    Nickname{" "}
                  </Heading>
                  <Text pl="2vw">{userData.nickname}</Text>
                </Box>
              </Flex>
              <Center>
                <HistoryCard matches={history} />
                <StatsCard {...stats} />
              </Center>
            </Stack>
          </CardBody>
        </Card>
      </Flex>
    </Center>
  );
}

Profile.getLayout = function getLayoutPage(page: ReactElement) {
  return <PageLayout>{page}</PageLayout>;
};
