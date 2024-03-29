"use client";
import { PropsWithChildren, useContext, useEffect, useState } from "react";
import {
  Flex,
  Container,
  Image,
  Center,
  Button,
  Heading,
  Highlight,
  Text,
  HStack,
  Box,
  Icon,
  Avatar,
  Wrap,
  VisuallyHidden,
  useBreakpointValue,
  LinkBox,
  LinkOverlay,
  useBreakpoint,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody,
} from "@chakra-ui/react";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
  MenuGroup,
  MenuOptionGroup,
  MenuDivider,
} from "@chakra-ui/react";
import { NextRouter, useRouter } from "next/router";
import dynamic from "next/dynamic";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { MeResponseData } from "@/lib/fetchers/me";
import { MeStateContext } from "../pageLayout/PageLayout";

const availableRoutes: Array<PongMenuItemProps> = [
  {
    text: "Dashboard",
    route: "/dashboard",
  },
  {
    text: "Chat",
    route: "/chat",
  },
];

interface PongMenuItemProps {
  route: "/dashboard" | "/chat";
  text: "Dashboard" | "Chat";
}
function PongMenuItem(
  props: React.PropsWithoutRef<PongMenuItemProps>
): JSX.Element {
  const { text, route } = props;
  const router = useRouter();

  function goTo() {
    router.push(route);
  }
  return (
    <MenuItem
      _hover={{ bg: "whiteAlpha.200" }}
      bgColor="pongBlue.400"
      onClick={goTo}
    >
      {text}
    </MenuItem>
  );
}

const DynamicNavBar = dynamic(() => Promise.resolve(PongNavBar), {
  ssr: false,
});
export default DynamicNavBar;

export function logOff(router: NextRouter, ls: Storage) {
  ls.removeItem("token");
  router.push("/");
}

type PongBarNavProps = React.PropsWithChildren<MeResponseData>;

function PongNavBar(props: PongBarNavProps): JSX.Element {
  const [me, setMe] = useContext(MeStateContext);
  const router = useRouter();
  const [isWide, setIsWide] = useState(window.innerWidth > 770);

  useEffect(() => {
    window.localStorage;
    const token = localStorage.getItem("token");
    if (token === null) {
      logOff(router, localStorage);
    }
  }, [router]);
  useEffect(() => {
    function updateWid() {
      setIsWide(window.innerWidth > 770);
    }
    window.addEventListener("resize", updateWid);
    return () => {
      window.removeEventListener("resize", updateWid);
    };
  }, []);
  return (
    <Flex direction="row" justify="space-between">
      <Center pl="2vw">
        <Menu>
          <MenuButton
            borderColor="pongBlue.500"
            borderWidth="2px"
            borderRadius="lg"
            minW="10vw"
            color="pongBlue.500"
          >
            <Container>
              <ChevronDownIcon color="pongBlue.500" boxSize="3vh" />
            </Container>
          </MenuButton>
          <MenuList bgColor="pongBlue.400">
            {availableRoutes
              .filter((e) => e.route !== router.route)
              .map((e, i) => (
                <PongMenuItem text={e.text} route={e.route} key={`nav-${i}`} />
              ))}
          </MenuList>
        </Menu>
      </Center>
      <Image
        src="logopong_login.png"
        alt="pong logo"
        maxH="10vh"
        p="1vh 1vw"
        fit="contain"
      />
      <UserClickableAvatar isWide={isWide} />
    </Flex>
  );
}

function UserClickableAvatar(props: { isWide: boolean }) {
  const [me] = useContext(MeStateContext);
  const router = useRouter();

  // TODO: Why this isn't a Menu component?
  return (
    <Popover gutter={0} isLazy>
      <PopoverTrigger>
        <Flex alignItems="center" justify="space-around" as="button">
          {props.isWide ? (
            <Heading color="pongBlue.500" size="sm" fontWeight="medium">
              {me ? me.nickname : "Not Found"}
            </Heading>
          ) : undefined}
          {props.isWide ? <Box w="2vw"></Box> : undefined}
          <Avatar bg="pongBlue.500" src={me?.avatar} />
          <Box w="2vw"></Box>
        </Flex>
      </PopoverTrigger>
      <PopoverContent borderRadius={"xl"} bgColor={"pongBlue.400"}>
        <PopoverArrow bgColor={"pongBlue.400"} />
        <PopoverBody>
          <Container
            _hover={{ bg: "whiteAlpha.200" }}
            cursor="pointer"
            onClick={() => router.push("/account")}
          >
            Account
          </Container>
          <Container
            _hover={{ bg: "whiteAlpha.200" }}
            cursor="pointer"
            onClick={() => router.push(`/profile/${me.intra_login}`)}
          >
            Profile
          </Container>
          <Container
            _hover={{ bg: "whiteAlpha.200" }}
            cursor="pointer"
            onClick={() => {
              logOff(router, localStorage);
            }}
          >
            Logout
          </Container>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
