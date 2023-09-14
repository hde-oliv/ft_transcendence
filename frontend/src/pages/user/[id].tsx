import { Flex } from "@chakra-ui/react";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { Stack, Center, Avatar, Box, Text, Divider } from "@chakra-ui/react";
import Head from "next/head";
import StatusBadge from "@/components/user/StatusBadge";
import api from "@/lib/Api";
import User from "@/interfaces/User";

interface UserBoxProps {
  user: User;
}

const UserBox = ({ user }: UserBoxProps) => {
  return (
    <Box>
      <Flex width="100%" p="10" pr="0" flex="3">
        <Flex
          width="100%"
          m="10"
          alignItems="center"
          flexDirection="column"
          borderRadius="xl"
          rounded="xl"
          bg="whiteAlpha.50"
          boxShadow="lg"
          p="10"
        >
          <Avatar
            mt="10"
            boxSize="280px"
            borderRadius="full"
            objectFit="cover"
            src={user.avatar}
          />
          <Stack flexDirection={"row"}>
            <Text fontFamily="heading" fontWeight={"bold"} fontSize="4xl">
              {user.fullName}
            </Text>
            <Center mt="2">
              <StatusBadge rawStatus={user.status} />
            </Center>
          </Stack>
          <Text>{user.email}</Text>
          <Divider m="5" />
        </Flex>
      </Flex>
    </Box>
  );
};

const UserPage = ({
  user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <Flex flexDirection="column" height="100vh" width="100%">
      <Head>
        <title>{user.fullName}</title>
      </Head>
      <UserBox user={user} />
    </Flex>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  // https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables

  // TODO: Check if Next/React reads env variables from the shell
  const user = await api.get(
    `http://${process.env.BACKEND_URL}:3000/user/${context.params?.id}`
  );

  return {
    props: { user: user },
  };
};

export default UserPage;
