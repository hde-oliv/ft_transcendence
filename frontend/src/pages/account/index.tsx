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
import pinkGuy from "../../components/pageComponents/account/pinkGuy";
import { getMe, updateMe } from "@/lib/fetchers/me";
import { DisableTPOModal } from "../../components/pageComponents/account/DisableTPOModal";
import { UserNickSegment } from "../../components/pageComponents/account/UserNickSegment";
import { useAuthSafeFetch } from "@/lib/fetchers/SafeAuthWrapper";
import { useRouter } from "next/router";

export const ModalContext = createContext<() => void>(() => { }); //used by Modals of this page

const base64Image = pinkGuy;

export type userData = {
  forthyTwoTag: string;
  avatar: string;
  nickname: string;
  otpEnabled: boolean;
};

type AvatarEditProps = userData & {
  updateAvatar: (str: string) => void;
};

function AvatarEditComponent(props: AvatarEditProps): JSX.Element {
  const { avatar, updateAvatar: setAvatar, forthyTwoTag: intraTag } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [tempAvatar, setTempAvatar] = useState(avatar);
  const [uploaded, setUploaded] = useState(false);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const [me, syncMe] = useContext(MeStateContext);
  const router = useRouter();

  async function saveNewAvatar() {
    const params = {
      intra_login: intraTag,
      avatar: tempAvatar,
    };
    try {
      if (await useAuthSafeFetch(router, updateMe, params)) {
        syncMe();
        setAvatar(tempAvatar);
        onClose();
        setUploaded(false);
      } else {
        console.log("failed to update nickname");
        setTimeout(() => {
          setTempAvatar(avatar);
          setUploaded(false);
        }, 200);
      }
    } catch (e) {
      console.log(e);
      setTimeout(() => {
        setTempAvatar(avatar);
        setUploaded(false);
      }, 200);
    }
  }
  function loadImage(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target) {
        const newAvatar = e.target.result;
        if (typeof newAvatar === "string") {
          setTempAvatar(newAvatar);
        }
      }
    };
    if (files) {
      if (files.length > 0) {
        if (files[0].type.includes("image")) {
          reader.readAsDataURL(files[0]);
          setUploaded(true);
        }
      }
    }
  }
  return (
    <>
      <Flex justify="center" pb="2vh">
        <Avatar size="2xl" src={tempAvatar}>
          <AvatarBadge border="none" bg="transparent">
            <IconButton
              colorScheme="yellow"
              aria-label="Edit Avatar"
              size="lg"
              isRound={true}
              isDisabled={isOpen}
              onClick={onOpen}
              icon={<EditIcon />}
            />
          </AvatarBadge>
        </Avatar>
      </Flex>
      <input
        type="file"
        accept="image/*"
        ref={hiddenRef}
        style={{ display: "none" }}
        onChange={loadImage}
      />
      <Collapse in={isOpen}>
        <Center>
          <Button
            aria-label="cancel image upload"
            colorScheme="red"
            onClick={() => {
              setTempAvatar(avatar);
              setUploaded(false);
              onClose();
            }}
            rightIcon={<CloseIcon />}
          >
            Cancel
          </Button>
          <Button
            colorScheme={uploaded ? "green" : "yellow"}
            aria-label="upload image button"
            leftIcon={uploaded ? <CheckIcon /> : <AttachmentIcon />}
            onClick={() => {
              if (uploaded) {
                saveNewAvatar();
              } else {
                if (hiddenRef.current) {
                  hiddenRef.current.click();
                }
              }
            }}
          >
            {uploaded ? "Confirm" : "Upload"}
          </Button>
        </Center>
      </Collapse>
    </>
  );
}

export default function Account(props: any) {
  const router = useRouter();
  const {
    isOpen: isOpenTF,
    onOpen: onOpenTF,
    onClose: onCloseTF,
  } = useDisclosure();
  const {
    isOpen: isOpenDisabler,
    onOpen: onOpenDisabler,
    onClose: onCloseDisabler,
  } = useDisclosure();
  const [userData, setUserData] = useState<undefined | userData>(undefined);
  const [userAvatar, setUserAvatar] = useState(base64Image);

  function updateNickName(updatedNickName: string) {
    if (userData !== undefined) {
      const tmp = {
        ...userData,
      };
      tmp.nickname = updatedNickName;
      setUserData(tmp);
    }
  }

  const OTPButton = () => {
    if (userData) {
      if (userData.otpEnabled) {
        return (
          <Button
            rightIcon={<LockIcon bg="transparent" />}
            pl="vw"
            aria-label="Enable two factor auth"
            bg="green.500"
            colorScheme="green"
            onClick={onOpenDisabler}
          >
            Disable
          </Button>
        );
      }
      return (
        <Button
          rightIcon={<UnlockIcon bg="transparent" />}
          pl="vw"
          aria-label="Enable two factor auth"
          bg="red.500"
          colorScheme="red"
          onClick={onOpenTF}
        >
          Enable
        </Button>
      );
    }
  };
  function setOTPState(newValue: boolean) {
    if (userData !== undefined) {
      const temp = { ...userData };
      temp.otpEnabled = newValue;
      setUserData(temp);
    }
  }
  useEffect(() => {
    (async () => {
      try {
        const ftData = await useAuthSafeFetch(router, getMe);
        let tmp: userData = {
          forthyTwoTag: ftData.intra_login,
          avatar: ftData.avatar,
          nickname: ftData.nickname,
          otpEnabled: ftData.otp_enabled,
        };
        setUserData(tmp);
        setUserAvatar(tmp.avatar);
      } catch (e) {
        console.log(e);
      }
    })();
  }, []);
  if (!userData) return <Center>Loading</Center>;
  return (
    <Center pt="2vh">
      <Flex flexDir="column">
        <Card bg="pongBlue.500">
          <CardHeader w="80vw">
            <Heading textAlign="center">Account details</Heading>
          </CardHeader>
          <CardBody>
            <Stack divider={<StackDivider />} pl="20%" pr="20%">
              <AvatarEditComponent
                {...userData}
                avatar={userAvatar}
                updateAvatar={setUserAvatar}
              />
              <Box>
                <Heading pl="1vw" size="sm">
                  Intra Tag{" "}
                </Heading>
                <Text pl="2vw">{userData.forthyTwoTag}</Text>
              </Box>
              <UserNickSegment {...userData} updateNickName={updateNickName} />
              <Box>
                <ActivateTPOModal
                  isOpen={isOpenTF}
                  onClose={onCloseTF}
                  setOTP={setOTPState}
                />
                <DisableTPOModal
                  isOpen={isOpenDisabler}
                  onClose={onCloseDisabler}
                  setOTP={setOTPState}
                />
                <Heading pl="1vw" size="sm">
                  Security{" "}
                </Heading>
                <Flex pl="1vw" justify="space-between">
                  <Text pl="1vw">
                    Two Factor Authenticator is{" "}
                    {userData.otpEnabled ? "enabled" : "disabled"}
                  </Text>
                  <OTPButton />
                </Flex>
              </Box>
            </Stack>
          </CardBody>
        </Card>
      </Flex>
    </Center>
  );
}

Account.getLayout = function getLayoutPage(page: ReactElement) {
  return <PageLayout>{page}</PageLayout>;
};
